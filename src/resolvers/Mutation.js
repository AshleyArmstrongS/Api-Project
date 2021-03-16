const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getUserId } = require("../utils");
const Animal = require("../models/animals");
const Farmer = require("../models/farmer");
const Medication = require("../models/medication");
const Group = require("../models/group");
const MedicationAdministration = require("../models/medication_administration");
const { APP_SECRET } = require("../Config");
const {
  FAILED_AUTHENTICATION,
  OPERATION_SUCCESSFUL,
  ALREADY_EXISTS,
  OPERATION_FAILED,
  NO_SUCH_EMAIL,
  INCORRECT_PASSWORD,
} = require("./ResolverErrorMessages");
const breed = require("../models/breed");

//Internal functions
function farmerHerdNo(id) {
  return Farmer.findById(id).select({ herd_number: 1, _id: 0 });
}
function errorConstructor(RESOLVER_ERROR, schema_error) {
  const message =
    RESOLVER_ERROR.message +
    schema_error.toString().replace("ValidationError: ", " ");
  return { success: RESOLVER_ERROR.success, message: message };
}
async function checkMedicationAvailability(id, quantity_used) {
  const available = await Medication.findById(id).select({
    remaining_quantity: 1,
    quantity_type: 1,
    _id: 0,
  });
  if (available.remaining_quantity >= quantity_used) {
    return available;
  }
  return false;
}
async function updateMedicationQuantity(id, quantity_used) {
  const valid = await Medication.findByIdAndUpdate(
    { _id: id },
    { $inc: { remaining_quantity: -quantity_used } }
  );
  if (valid) {
    return true;
  }
  return false;
}
async function restoreMedicationQuantity(id, quantity_used) {
  const valid = await Medication.findByIdAndUpdate(
    { _id: id },
    { $inc: { remaining_quantity: +quantity_used } }
  );
  if (valid) {
    return true;
  }
  return false;
}
async function addMedAdministrator(id, med_administrator) {
  const validPresent = await Farmer.find({
    medication_administrators: { $exists: true, $in: med_administrator },
    _id: id,
  });
  console.log("Hello");
  console.log(validPresent);
  const valid = await Farmer.findByIdAndUpdate(
    { _id: id },
    { $push: { medication_administrators: med_administrator } }
  );
  if (valid || validPresent) {
    return true;
  }
  return false;
}
//Login/SignUp
async function signUp(parent, args) {
  try {
    const alreadyExists = await Farmer.findOne({ email: args.email });
    if (alreadyExists) {
      return { responseCheck: ALREADY_EXISTS };
    }
    const password = await bcrypt.hash(args.password, 10);
    const med_administrator = args.first_name + " " + args.second_name;
    const newFarmer = new Farmer({
      first_name: args.first_name,
      second_name: args.second_name,
      farm_type: args.farm_type,
      farm_address: args.farm_address ?? null,
      password: password,
      medication_administrators: med_administrator,
      email: args.email,
      herd_number: args.herd_number,
    });
    const valid = await newFarmer.save();
    if (!valid) {
      return { responseCheck: OPERATION_FAILED };
    }
    const userToken = jwt.sign({ newFarmer: newFarmer._id }, APP_SECRET);
    return {
      responseCheck: OPERATION_SUCCESSFUL,
      token: userToken,
      farmer: newFarmer,
    };
  } catch (err) {
    return { responseCheck: errorConstructor(OPERATION_FAILED, err) };
  }
}
async function login(parent, args) {
  const loggingInFarmer = await Farmer.findOne({ email: args.email });
  if (!loggingInFarmer) {
    return { responseCheck: NO_SUCH_EMAIL };
  }
  const valid = await bcrypt.compare(args.password, loggingInFarmer.password);
  if (!valid) {
    return { responseCheck: INCORRECT_PASSWORD };
  }
  const userToken = jwt.sign({ userId: loggingInFarmer.id }, APP_SECRET);
  return {
    responseCheck: OPERATION_SUCCESSFUL,
    token: userToken,
    farmer: loggingInFarmer,
  };
}
//Animal Mutations
async function saveAnimal(parent, args, context) {
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    if (args.id) {
      returnable = await updateAnimal(args);
    } else {
      returnable = await createAnimal(args, farmer_id);
    }
  }
  return returnable;
}
async function createAnimal(args, farmer_id) {
  try {
    const herd_number = await farmerHerdNo(farmer_id);
    console.log(herd_number)
    const alreadyExists = await Animal.findOne({
      tag_number: args.tag_number,
      farmer_id: farmer_id,
    });
    if (!alreadyExists) {
      const newAnimal = new Animal({
        tag_number: args.tag_number,
        herd_number: herd_number.herd_number,
        sire_number: args.sire_number,
        mother_number: args.mother_number,
        male_female: args.male_female,
        breed_type: args.breed_type,
        date_of_birth: args.date_of_birth,
        pure_breed: args.pure_breed ?? false,
        animal_name: args.animal_name ?? null,
        description: args.description ?? null,
        farmer_id: farmer_id,
      });
      const valid = await newAnimal.save();
      if (!valid) {
        return { responseCheck: OPERATION_FAILED };
      }
      return {
        responseCheck: OPERATION_SUCCESSFUL,
        animal: newAnimal,
      };
    }
    return { responseCheck: ALREADY_EXISTS };
  } catch (err) {
    return { responseCheck: errorConstructor(OPERATION_FAILED, err) };
  }
}
async function updateAnimal(args) {
  const valid = await Animal.findByIdAndUpdate(
    { _id: args.id },
    {
      sire_number: args.sire_number,
      mother_number: args.mother_number,
      male_female: args.male_female,
      breed_type: args.breed_type,
      date_of_birth: args.date_of_birth,
      pure_breed: args.pure_breed ?? false,
      animal_name: args.animal_name ?? null,
      description: args.description ?? null,
    }
  );
  if (!valid) {
    return { responseCheck: OPERATION_FAILED };
  }
  const editedAnimal = Animal.findOne({ _id: args.id });
  return {
    responseCheck: OPERATION_SUCCESSFUL,
    animal: editedAnimal,
  };
}
async function deleteAnimal(parent, args, context) {
  const id = await getUserId(context);
  if (!id) {
    return { responseCheck: FAILED_AUTHENTICATION };
  }
  const valid = await Animal.findByIdAndDelete(args.id);
  if (!valid) {
    return { responseCheck: OPERATION_FAILED };
  }
  return {
    responseCheck: OPERATION_SUCCESSFUL,
    animal: valid,
  };
}
// Group Mutations
async function saveGroup(parent, args, context) {
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    if (args.id) {
      returnable = updateGroup(args, farmer_id);
    } else {
      returnable = createGroup(args, farmer_id);
    }
  }
  return returnable;
}
async function createGroup(args, farmer_id) {
  try {
    const alreadyExists = await Group.findOne({
      group_name: args.group_name,
      farmer_id: farmer_id,
    });
    if (!alreadyExists) {
      const newGroup = new Group({
        group_name: args.group_name,
        group_description: args.group_description ?? null,
        farmer_id: farmer_id,
      });
      const valid = await newGroup.save();
      if (!valid) {
        return { responseCheck: OPERATION_FAILED };
      }
      return {
        responseCheck: OPERATION_SUCCESSFUL,
        group: newGroup,
      };
    }
    return { responseCheck: ALREADY_EXISTS };
  } catch (err) {
    return { responseCheck: errorConstructor(OPERATION_FAILED, err) };
  }
}
async function updateGroup(args) {
  const valid = await Group.findByIdAndUpdate(
    { _id: args.id },
    {
      group_name: args.group_name,
      group_description: args.group_description ?? null,
    }
  );
  if (!valid) {
    return { responseCheck: OPERATION_FAILED };
  }
  const editedGroup = Group.findOne({ _id: args.id });
  return {
    responseCheck: OPERATION_SUCCESSFUL,
    group: editedGroup,
  };
}
async function addAnimalToGroup(parent, args, context) {
  const id = getUserId(context);
  if (!id) {
    return FAILED_AUTHENTICATION;
  }
  const groupPresent = await animal.findOne({
    _id: args.id,
    groups_id: args.groups_id,
  });
  if (!groupPresent) {
    const valid = await Animal.findByIdAndUpdate(
      { _id: args.id },
      { $push: { groups_id: args.groups_id } }
    );
    if (!valid) {
      return { responseCheck: OPERATION_FAILED };
    }
    const editedAnimal = Animal.findOne({ _id: args.id });
    return {
      responseCheck: OPERATION_SUCCESSFUL,
      animal: editedAnimal,
    };
  } else {
    return { responseCheck: ALREADY_EXISTS };
  }
}
async function removeAnimalFromGroup(parent, args, context) {
  const id = getUserId(context);
  if (!id) {
    return FAILED_AUTHENTICATION;
  }
  const valid = await Animal.findByIdAndUpdate(
    { _id: args.id },
    { $pull: { groups_id: args.groups_id } }
  );
  if (!valid) {
    return { responseCheck: OPERATION_FAILED };
  }
  const editedAnimal = Animal.findOne({ _id: args.id });
  return {
    responseCheck: OPERATION_SUCCESSFUL,
    animal: editedAnimal,
  };
}
async function deleteGroup(parent, args, context) {
  const farmer_id = getUserId(context);
  if (!farmer_id) {
    return FAILED_AUTHENTICATION;
  }
  await Animal.updateMany(
    {
      groups_id: args.id,
      farmer_id: farmer_id,
    },
    { $pull: { groups_id: args.id } }
  );
  const deletedGroup = await Group.findByIdAndDelete(args.id);
  if (deletedGroup) {
    return {
      responseCheck: OPERATION_SUCCESSFUL,
      group: deletedGroup,
    };
  }
  return {
    responseCheck: OPERATION_FAILED,
  };
}
//Medication Mutations
async function saveMedication(parent, args, context) {
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    if (args.id) {
      returnable = updateMedication(args);
    } else {
      returnable = createMedication(args, farmer_id);
    }
  }
  return returnable;
}
async function createMedication(args, farmer_id) {
  try {
    const newMedication = new Medication({
      medication_name: args.medication_name,
      supplied_by: args.supplied_by ?? null,
      quantity: args.quantity,
      quantity_type: args.quantity_type,
      remaining_quantity: args.quantity,
      withdrawal_days_meat: args.withdrawal_days_meat ?? null,
      withdrawal_days_dairy: args.withdrawal_days_dairy ?? null,
      batch_number: args.batch_number ?? null,
      expiry_date: args.expiry_date ?? null,
      purchase_date: args.purchase_date ?? null,
      comments: args.comments ?? null,
      farmer_id: farmer_id,
    });
    const valid = await newMedication.save();
    if (!valid) {
      return { responseCheck: OPERATION_FAILED };
    }
    return {
      responseCheck: OPERATION_SUCCESSFUL,
      medication: newMedication,
    };
  } catch (err) {
    return { responseCheck: errorConstructor(OPERATION_FAILED, err) };
  }
}
async function updateMedication(args) {
  const current_medication = await Medication.findById(args.id).select({
    _id: 0,
    remaining_quantity: 1,
    quantity: 1,
  });
  const remaining =
    current_medication.quantity - current_medication.remaining_quantity;
  const valid = await Medication.findByIdAndUpdate(
    { _id: args.id },
    {
      medication_name: args.medication_name,
      supplied_by: args.supplied_by ?? null,
      quantity: args.quantity,
      quantity_type: args.quantity_type,
      remaining_quantity: args.quantity - remaining,
      withdrawal_days_dairy: args.withdrawal_days_dairy ?? null,
      withdrawal_days_meat: args.withdrawal_days_meat ?? null,
      batch_number: args.batch_number ?? null,
      expiry_date: args.expiry_date ?? null,
      purchase_date: args.purchase_date ?? null,
      comments: args.comments ?? null,
    }
  );
  if (!valid) {
    return { responseCheck: OPERATION_FAILED };
  }
  const updatedMedication = await Medication.findOne({ _id: args.id });
  return {
    responseCheck: OPERATION_SUCCESSFUL,
    medication: updatedMedication,
  };
}
//MedicationAdministration Mutations
async function saveAdminMed(parent, args, context) {
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    if (args.id) {
      returnable = updateAdminMed(args);
    } else {
      returnable = createAdminMed(args, farmer_id);
    }
  }
  return returnable;
}
async function createAdminMed(args, farmer_id) {
  try {
    const available = await checkMedicationAvailability(
      args.medication_id,
      args.quantity_administered
    );
    var message = "Medication not administered";
    if (available) {
      const newMedAdmin = await new MedicationAdministration({
        date_of_administration: args.date_of_administration,
        quantity_administered: args.quantity_administered,
        quantity_type: available.quantity_type,
        administered_by: args.administered_by,
        reason_for_administration: args.reason_for_administration ?? null,
        animal_id: args.animal_id,
        medication_id: args.medication_id,
        farmer_id: farmer_id,
      });
      const valid = await newMedAdmin.save();
      if (valid) {
        await updateMedicationQuantity(
          args.medication_id,
          args.quantity_administered
        );
        await addMedAdministrator(farmer_id, args.administered_by);
        return {
          responseCheck: OPERATION_SUCCESSFUL,
          administeredMedication: newMedAdmin,
        };
      }
    } else {
      message = "Medication quantity is to low";
    }
    const responseCheck = { status: false, message: message };
    return { responseCheck: responseCheck };
  } catch (err) {
    return { responseCheck: errorConstructor(OPERATION_FAILED, err) };
  }
}
async function updateAdminMed(args) {
  const valid = await MedicationAdministration.findByIdAndUpdate(
    { _id: args.id },
    {
      date_of_administration: args.date_of_administration,
      quantity_administered: args.quantity_administered,
      administered_by: args.administered_by,
      reason_for_administration: args.reason_for_administration ?? null,
    }
  );
  if (!valid) {
    return { responseCheck: OPERATION_FAILED };
  }
  await restoreMedicationQuantity(
    args.medication_id,
    valid.quantity_administered
  );
  await updateMedicationQuantity(
    args.medication_id,
    args.quantity_administered
  );
  await addMedAdministrator(farmer_id, args.administered_by);
  const updatedMedication = await MedicationAdministration.findById(args.id);
  return {
    responseCheck: OPERATION_SUCCESSFUL,
    administeredMedication: updatedMedication,
  };
}
async function deleteAdministeredMedication(parent, args, context) {
  //restores the medication quantity
  const id = getUserId(context);
  if (!id) {
    return FAILED_AUTHENTICATION;
  }
  await restoreMedicationQuantity(
    args.medication_id,
    args.quantity_administered
  );
  const deletedAdminMed = await MedicationAdministration.findByIdAndDelete(
    args.id
  );
  if (deletedAdminMed) {
    return {
      responseCheck: OPERATION_SUCCESSFUL,
      administeredMedication: deletedAdminMed,
    };
  }
  return {
    responseCheck: OPERATION_FAILED,
  };
}
async function deleteMedAdministrator(id, med_administrator) {
  const valid = farmer.findByIdAndUpdate(
    { _id: id },
    { $pull: { medication_administrators: med_administrator } }
  );
  if (valid) {
    return true;
  }
  return false;
}
async function saveBreed(parent, args, context) {
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    const valid = await breed.save({
      breed_name: args.breed_name,
      breed_code: args.breed_code,
    });
    if (valid) {
      returnable = { responseCheck: OPERATION_SUCCESSFUL, breed: valid };
    }
    returnable = { responseCheck: OPERATION_FAILED };
  }
  return returnable;
}

module.exports = {
  signUp,
  login,
  saveAnimal,
  deleteAnimal,
  saveGroup,
  addAnimalToGroup,
  removeAnimalFromGroup,
  deleteGroup,
  saveMedication,
  saveAdminMed,
  deleteAdministeredMedication,
  deleteMedAdministrator,
  saveBreed,
};
