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
  PASSWORD_RESET_FAILED,
  INCORRECT_MOTHER,
  INCORRECT_SIRE,
  INCORRECT_PARENTS,
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
  if (!validPresent) {
    const valid = await Farmer.findByIdAndUpdate(
      { _id: id },
      { $push: { medication_administrators: med_administrator } }
    );
    if (!valid) {
      return false;
    }
    return true;
  }
  return true;
}
async function addLastCalvedToDam(dam_no, farmer_id, date) {
  const dam_id = await Animal.findOne({
    tag_number: dam_no,
    farmer_id: farmer_id,
  }).select({ _id: 1 });
  if (dam_id) {
    await Animal.findByIdAndUpdate({ _id: dam_id._id }, { last_calved: date });
  }
}
async function animalParentCheck(farmer_id, sire_number, mother_number) {
  var sire = await Animal.findOne({
    farmer_id: farmer_id,
    tag_number: sire_number,
  }).select({ _id: 0, male_female: 1 });
  var mother = await Animal.findOne({
    farmer_id: farmer_id,
    tag_number: mother_number,
  }).select({ _id: 0, male_female: 1 });
  if (sire) {
    if (sire.male_female == "M") {
      sire = true;
    } else {
      sire = false;
    }
  } else {
    sire = true;
  }
  if (mother) {
    if (mother.male_female == "F") {
      mother = true;
    } else {
      mother = false;
    }
  } else {
    mother = true;
  }
  return { sire: sire, mother: mother };
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
    const userToken = jwt.sign({ userId: newFarmer._id }, APP_SECRET);
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
  try {
    const loggingInFarmer = await Farmer.findOne({ email: args.email });
    if (!loggingInFarmer) {
      return { responseCheck: NO_SUCH_EMAIL };
    }
    const valid = await bcrypt.compare(args.password, loggingInFarmer.password);
    if (!valid) {
      return { responseCheck: INCORRECT_PASSWORD };
    }
    const userToken = jwt.sign({ userId: loggingInFarmer._id }, APP_SECRET);
    return {
      responseCheck: OPERATION_SUCCESSFUL,
      token: userToken,
      farmer: loggingInFarmer,
    };
  } catch (err) {
    return { responseCheck: errorConstructor(OPERATION_FAILED, err) };
  }
}
async function passwordResetAndLogin(parent, args) {
  try {
    const farmerToBeChanged = await Farmer.findOne({ email: args.email });
    const valid = await bcrypt.compare(
      args.password,
      farmerToBeChanged.password
    );
    var success = false;
    if (valid) {
      const new_password = await bcrypt.hash(args.new_password, 10);
      success = await Farmer.findByIdAndUpdate(
        { _id: farmerToBeChanged._id },
        { password: new_password }
      );
    } else {
      return { responseCheck: INCORRECT_PASSWORD };
    }
    if (success) {
      const updated = await Farmer.findOne({ email: args.email }).select({
        password: 0,
      });
      const userToken = jwt.sign({ userId: updated._id }, APP_SECRET);
      return {
        responseCheck: OPERATION_SUCCESSFUL,
        token: userToken,
        farmer: updated,
      };
    }
    return { responseCheck: PASSWORD_RESET_FAILED };
  } catch (err) {
    return { responseCheck: errorConstructor(OPERATION_FAILED, err) };
  }
}
async function updateFarmer(parent, args, context) {
  try {
    const farmer_id = getUserId(context);
    const farmerToBeChanged = await Farmer.findById(farmer_id).select({
      password: 0,
    });
    const success = await Farmer.findByIdAndUpdate(
      { _id: farmerToBeChanged._id },
      {
        first_name: args.first_name ?? farmerToBeChanged.first_name,
        second_name: args.second_name ?? farmerToBeChanged.second_name,
        farm_address: args.farm_address ?? farmerToBeChanged.farm_address,
        farm_type: args.farm_type ?? farmerToBeChanged.farm_type,
      }
    );
    if (success) {
      const updated = await Farmer.findById(farmer_id).select({
        password: 0,
      });
      return {
        responseCheck: OPERATION_SUCCESSFUL,
        farmer: updated,
      };
    }
    return { responseCheck: PASSWORD_RESET_FAILED };
  } catch (err) {
    return { responseCheck: errorConstructor(OPERATION_FAILED, err) };
  }
}
//Animal Mutations
async function saveAnimal(parent, args, context) {
  try {
    const farmer_id = getUserId(context);
    var returnable = { responseCheck: FAILED_AUTHENTICATION };
    if (farmer_id) {
      if (args._id) {
        returnable = await updateAnimal(args, farmer_id);
      } else {
        const animal = await Animal.findOne({
          farmer_id: farmer_id,
          tag_number: args.tag_number,
          removed: true,
        }).select({ _id: 1 });
        if (animal) {
          args._id = animal._id;
          returnable = await updateAnimal(args, farmer_id);
        } else {
          returnable = await createAnimal(args, farmer_id);
        }
      }
    }
    return returnable;
  } catch (err) {
    return { responseCheck: errorConstructor(OPERATION_FAILED, err) };
  }
}
async function createAnimal(args, farmer_id) {
  try {
    const herd_number = await farmerHerdNo(farmer_id);
    const parents = await animalParentCheck(
      farmer_id,
      args.sire_number,
      args.mother_number
    );
    const alreadyExists = await Animal.findOne({
      tag_number: args.tag_number,
      farmer_id: farmer_id,
    });
    if (parents.sire && parents.mother) {
      if (!alreadyExists) {
        const newAnimal = new Animal({
          tag_number: args.tag_number,
          herd_number: herd_number.herd_number,
          removed: false,
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
        await addLastCalvedToDam(
          args.mother_number,
          farmer_id,
          args.date_of_birth
        );
        return {
          responseCheck: OPERATION_SUCCESSFUL,
          animal: newAnimal,
        };
      }
      return { responseCheck: ALREADY_EXISTS };
    }
    if (!parents.sire && !parents.mother) {
      return { responseCheck: INCORRECT_PARENTS };
    }
    if (!parents.sire) {
      return { responseCheck: INCORRECT_SIRE };
    }
    return { responseCheck: INCORRECT_MOTHER };
  } catch (err) {
    return { responseCheck: errorConstructor(OPERATION_FAILED, err) };
  }
}
async function updateAnimal(args, farmer_id) {
  try {
    const animalToEdit = await Animal.findById(args._id);
    const valid = await Animal.findByIdAndUpdate(
      { _id: args._id },
      {
        sire_number: args.sire_number ?? animalToEdit.sire_number,
        mother_number: args.mother_number ?? animalToEdit.mother_number,
        male_female: args.male_female ?? animalToEdit.male_female,
        breed_type: args.breed_type ?? animalToEdit.breed_type,
        removed: false,
        date_of_birth: args.date_of_birth ?? animalToEdit.date_of_birth,
        pure_breed: args.pure_breed ?? animalToEdit.pure_breed ?? false,
        animal_name: args.animal_name ?? animalToEdit.animal_name ?? null,
        description: args.description ?? animalToEdit.description ?? null,
      }
    );
    if (!valid) {
      return { responseCheck: OPERATION_FAILED };
    }
    const editedAnimal = await Animal.findOne({ _id: args._id });
    ed;
    await addLastCalvedToDam(
      editedAnimal.mother_number,
      farmer_id,
      editedAnimal.date_of_birth
    );
    return {
      responseCheck: OPERATION_SUCCESSFUL,
      animal: editedAnimal,
    };
  } catch (err) {
    return { responseCheck: errorConstructor(OPERATION_FAILED, err) };
  }
}
async function deleteAnimal(parent, args, context) {
  try {
    const id = await getUserId(context);
    if (!id) {
      return { responseCheck: FAILED_AUTHENTICATION };
    }
    const valid = await Animal.findByIdAndUpdate(
      { _id: args._id },
      {
        removed: true,
        groups_id: [null],
      }
    );
    if (!valid) {
      return { responseCheck: OPERATION_FAILED };
    }
    return {
      responseCheck: OPERATION_SUCCESSFUL,
      animal: valid,
    };
  } catch (err) {
    return { responseCheck: errorConstructor(OPERATION_FAILED, err) };
  }
}
// Group Mutations
async function saveGroup(parent, args, context) {
  try {
    const farmer_id = getUserId(context);
    var returnable = { responseCheck: FAILED_AUTHENTICATION };
    if (farmer_id) {
      if (args._id) {
        returnable = updateGroup(args, farmer_id);
      } else {
        returnable = createGroup(args, farmer_id);
      }
    }
    return returnable;
  } catch (err) {
    return { responseCheck: errorConstructor(OPERATION_FAILED, err) };
  }
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
        group_size: 0,
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
  try {
    const groupToUpdate = await Group.findById(args._id);
    const valid = await Group.findByIdAndUpdate(
      { _id: args._id },
      {
        group_name: args.group_name ?? groupToUpdate.group_name,
        group_description:
          args.group_description ?? groupToUpdate.description ?? null,
      }
    );
    if (!valid) {
      return { responseCheck: OPERATION_FAILED };
    }
    const editedGroup = Group.findOne({ _id: args._id });
    return {
      responseCheck: OPERATION_SUCCESSFUL,
      group: editedGroup,
    };
  } catch (err) {
    return { responseCheck: errorConstructor(OPERATION_FAILED, err) };
  }
}
async function addAnimalToGroup(parent, args, context) {
  try {
    const id = getUserId(context);
    if (!id) {
      return FAILED_AUTHENTICATION;
    }
    const groupPresent = await Animal.findOne({
      _id: args._id,
      groups_id: args.groups_id,
    });
    if (!groupPresent) {
      const valid = await Animal.findByIdAndUpdate(
        { _id: args._id },
        { $push: { groups_id: args.groups_id } }
      );
      if (!valid) {
        return { responseCheck: OPERATION_FAILED };
      }
      await Group.findByIdAndUpdate(
        { _id: args.groups_id },
        { $inc: { group_size: +1 } }
      );
      const editedAnimal = Animal.findOne({ _id: args._id });
      return {
        responseCheck: OPERATION_SUCCESSFUL,
        animal: editedAnimal,
      };
    } else {
      return { responseCheck: ALREADY_EXISTS };
    }
  } catch (err) {
    return { responseCheck: errorConstructor(OPERATION_FAILED, err) };
  }
}
async function removeAnimalFromGroup(parent, args, context) {
  try {
    const id = getUserId(context);
    if (!id) {
      return FAILED_AUTHENTICATION;
    }
    const valid = await Animal.findByIdAndUpdate(
      { _id: args._id },
      { $pull: { groups_id: args.groups_id } }
    );
    if (!valid) {
      return { responseCheck: OPERATION_FAILED };
    }
    await Group.findByIdAndUpdate(
      { _id: args.groups_id },
      { $inc: { group_size: -1 } }
    );
    const editedAnimal = Animal.findOne({ _id: args._id });
    return {
      responseCheck: OPERATION_SUCCESSFUL,
      animal: editedAnimal,
    };
  } catch (err) {
    return { responseCheck: errorConstructor(OPERATION_FAILED, err) };
  }
}
async function deleteGroup(parent, args, context) {
  try {
    const farmer_id = getUserId(context);
    if (!farmer_id) {
      return FAILED_AUTHENTICATION;
    }
    await Animal.updateMany(
      {
        groups_id: args._id,
        farmer_id: farmer_id,
      },
      { $pull: { groups_id: args._id } }
    );
    const deletedGroup = await Group.findByIdAndDelete(args._id);
    if (deletedGroup) {
      return {
        responseCheck: OPERATION_SUCCESSFUL,
        group: deletedGroup,
      };
    }
    return {
      responseCheck: OPERATION_FAILED,
    };
  } catch (err) {
    return { responseCheck: errorConstructor(OPERATION_FAILED, err) };
  }
}
//Medication Mutations
async function saveMedication(parent, args, context) {
  try {
    const farmer_id = getUserId(context);
    var returnable = { responseCheck: FAILED_AUTHENTICATION };
    if (farmer_id) {
      if (args._id) {
        returnable = updateMedication(args);
      } else {
        returnable = createMedication(args, farmer_id);
      }
    }
    return returnable;
  } catch (err) {
    return { responseCheck: errorConstructor(OPERATION_FAILED, err) };
  }
}
async function createMedication(args, farmer_id) {
  try {
    const newMedication = new Medication({
      medication_name: args.medication_name,
      supplied_by: args.supplied_by ?? null,
      quantity: args.quantity,
      quantity_type: args.quantity_type,
      remaining_quantity: args.quantity,
      medicine_type: args.medicine_type,
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
  try {
    const current_medication = await Medication.findById(args._id);
    const remaining =
      current_medication.quantity - current_medication.remaining_quantity;
    const valid = await Medication.findByIdAndUpdate(
      { _id: args._id },
      {
        medication_name: args.medication_name,
        supplied_by: args.supplied_by ?? current_medication.supplied_by ?? null,
        quantity: args.quantity ?? current_medication.quantity,
        quantity_type: args.quantity_type ?? current_medication.quantity_type,
        medicine_type: args.medicine_type ?? current_medication.medicine_type,
        remaining_quantity:
          args.quantity - remaining ?? current_medication.remaining_quantity,
        withdrawal_days_dairy:
          args.withdrawal_days_dairy ??
          current_medication.withdrawal_days_dairy ??
          null,
        withdrawal_days_meat:
          args.withdrawal_days_meat ??
          current_medication.withdrawal_days_meat ??
          null,
        batch_number:
          args.batch_number ?? current_medication.batch_number ?? null,
        expiry_date: args.expiry_date ?? current_medication.expiry_date ?? null,
        purchase_date:
          args.purchase_date ?? current_medication.purchase_date ?? null,
        comments: args.comments ?? current_medication.comments ?? null,
      }
    );
    if (!valid) {
      return { responseCheck: OPERATION_FAILED };
    }
    const updatedMedication = await Medication.findOne({ _id: args._id });
    return {
      responseCheck: OPERATION_SUCCESSFUL,
      medication: updatedMedication,
    };
  } catch (err) {
    return { responseCheck: errorConstructor(OPERATION_FAILED, err) };
  }
}
//MedicationAdministration Mutations
async function saveAdminMed(parent, args, context) {
  try {
    const farmer_id = getUserId(context);
    var returnable = { responseCheck: FAILED_AUTHENTICATION };
    if (farmer_id) {
      if (args._id) {
        returnable = updateAdminMed(args, farmer_id);
      } else {
        returnable = createAdminMed(args, farmer_id);
      }
    }
    return returnable;
  } catch (err) {
    return { responseCheck: errorConstructor(OPERATION_FAILED, err) };
  }
}
async function createAdminMed(args, farmer_id) {
  try {
    const available = await checkMedicationAvailability(
      args.medication_id,
      args.quantity_administered
    );
    var message = "Medication not administered";
    if (available) {
      const newMedAdmin = new MedicationAdministration({
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
async function updateAdminMed(args, farmer_id) {
  try {
    const adminMedToUpdate = MedicationAdministration.findById(args._id);
    const valid = await MedicationAdministration.findByIdAndUpdate(
      { _id: args._id },
      {
        date_of_administration:
          args.date_of_administration ??
          adminMedToUpdate.date_of_administration,
        quantity_administered:
          args.quantity_administered ?? adminMedToUpdate.quantity_administered,
        administered_by:
          args.administered_by ?? adminMedToUpdate.administered_by,
        reason_for_administration:
          args.reason_for_administration ??
          adminMedToUpdate.reason_for_admin ??
          null,
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
  } catch (err) {
    return { responseCheck: errorConstructor(OPERATION_FAILED, err) };
  }
}
async function deleteAdministeredMedication(parent, args, context) {
  try {
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
      args._id
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
  } catch (err) {
    return { responseCheck: errorConstructor(OPERATION_FAILED, err) };
  }
}
async function deleteMedAdministrator(parent, args, context) {
  try {
    const farmer_id = getUserId(context);
    if (farmer_id) {
      const valid = await Farmer.findByIdAndUpdate(
        { _id: farmer_id },
        { $pull: { medication_administrators: args.med_administrator } }
      );
      if (valid) {
        const updatedFarmer = await Farmer.findById({ _id: farmer_id });
        return { responseCheck: OPERATION_SUCCESSFUL, farmer: updatedFarmer };
      }
      return { responseCheck: OPERATION_FAILED };
    }
    return { responseCheck: FAILED_AUTHENTICATION };
  } catch (err) {
    return { responseCheck: errorConstructor(OPERATION_FAILED, err) };
  }
}
async function saveBreed(parent, args, context) {
  try {
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
  } catch (err) {
    return { responseCheck: errorConstructor(OPERATION_FAILED, err) };
  }
}
async function populateAnimals(parent, args, context) {
  try {
    const farmer_id = getUserId(context);
    var mf;
    var pure_breed;
    var name;
    var bt;
    var description;
    var dob;
    var x = 1;
    for (var i = 100; i <= args.pop + 100; i++) {
      if (x === 1) {
        mf = "M";
        pure_breed = true;
        bt = "CH";
        dob = "2020-09-09";
        name = "nameOne";
        description = "animal desc one";
        x = 2;
      } else if (x === 2) {
        mf = "F";
        bt = "LM";
        dob = "2020-10-10";
        name = "nameTwo";
        description = "animal desc two";
        pure_breed = true;
        x = 3;
      } else if (x === 3) {
        mf = "M";
        bt = "CHX";
        dob = "2020-11-11";
        name = "nameThree";
        description = "animal desc three";
        pure_breed = false;
        x = 4;
      } else if (x === 4) {
        mf = "F";
        dob = "2020-11-11";
        description = "animal desc four";
        name = "nameFour";
        bt = "LMX";
        pure_breed = false;
        x = 5;
      } else {
        mf = "M";
        dob = "2021-01-01";
        description = "animal desc five";
        bt = "HFX";
        name = "nameFive";
        pure_breed = false;
        x = 1;
      }
      var Animalargs = new Animal({
        tag_number: 80000 + i,
        sire_number: 70000 + i,
        mother_number: 50000 + i,
        male_female: mf,
        breed_type: bt,
        date_of_birth: dob,
        pure_breed: pure_breed,
        animal_name: name,
        description: description,
        farmer_id: farmer_id,
      });
      await createAnimal(Animalargs, farmer_id);
    }
    return "Animals added";
  } catch (err) {
    console.log(err);
    return "there was an error";
  }
}
async function populateMedications(parent, args, context) {
  try {
    const farmer_id = getUserId(context);
    var x = 1;
    var supplier = "";
    var qty_type;
    var med_type;
    var withdrawal_meat;
    var withdrawal_dairy;
    var batch_no;
    var date_exp;
    var date_pur;
    var comments;
    var name;
    for (var i = 1; i <= args.pop + 1; i++) {
      if (x === 1) {
        name = "nameOne";
        supplier = "supplierOne";
        qty_type = "MG";
        med_type = "VACCINATION";
        withdrawal_meat = 2;
        withdrawal_dairy = 90;
        date_exp = "2021-02-19";
        date_pur = "2020-12-19";
        comments = "some comments " + i + "comment type 1";

        x = 2;
      } else if (x === 2) {
        name = "nameTwo";
        supplier = "supplierTwo";
        qty_type = "ML";
        med_type = "ANTIBIOTIC";
        withdrawal_meat = 10;
        withdrawal_dairy = 13;
        date_exp = "2021-02-30";
        date_pur = "2021-01-01";
        comments = "some comments " + i + "comment type 2";
        x = 3;
      } else if (x === 3) {
        name = "nameThree";
        supplier = "supplierThree";
        qty_type = "COUNT";
        med_type = "VACCINATION";
        withdrawal_meat = 22;
        withdrawal_dairy = 34;
        date_exp = "2021-04-04";
        date_pur = "2018-02-09";
        comments = "some comments " + i + "comment type 3";
        x = 4;
      } else {
        name = "nameFour";
        supplier = "supplierFour";
        qty_type = "UNASSIGNED";
        med_type = "DOSE";
        withdrawal_meat = 40;
        withdrawal_dairy = 8;
        date_exp = "2021-11-08";
        date_pur = "2020-02-09";
        comments = "some comments " + i + "comment type 4";
        x = 1;
      }
      batch_no = "bch" + i;
      const newMedication = new Medication({
        medication_name: name,
        supplied_by: supplier,
        quantity: i,
        quantity_type: qty_type,
        remaining_quantity: i,
        medicine_type: med_type,
        withdrawal_days_meat: withdrawal_meat,
        withdrawal_days_dairy: withdrawal_dairy,
        batch_number: batch_no,
        expiry_date: date_exp,
        purchase_date: date_pur,
        comments: comments,
        farmer_id: farmer_id,
      });
      await createMedication(newMedication, farmer_id);
    }
    return "meds added";
  } catch (err) {
    console.log(err);
    return "there was an error";
  }
}
async function populateAdminMeds(parent, args, context) {
  try {
    const farmer_id = getUserId(context);
    const animals = await Animal.find({ farmer_id: farmer_id });
    const medications = await Medication.find({ farmer_id: farmer_id });
    var x = 1;
    var doa;
    var administered_by;
    var reason_for_admin;
    for (var i = 0; i <= args.pop; i++) {
      if (x === 1) {
        doa = "2021-02-02";
        administered_by = "userOne";
        reason_for_admin = "test reason One";
        x = 2;
      } else if (x === 2) {
        doa = "2021-04-05";
        administered_by = "userTwo";
        reason_for_admin = "test reason Two";
        x = 3;
      } else if (x === 3) {
        doa = "2021-03-06";
        administered_by = "userThree";
        reason_for_admin = "test reason Three";
        x = 4;
      } else {
        x = 1;
      }
      var newMedAdmin = new MedicationAdministration({
        date_of_administration: doa,
        quantity_administered: 4,
        quantity_type: medications[i].quantity_type,
        administered_by: administered_by,
        reason_for_administration: reason_for_admin,
        animal_id: animals[i]._id,
        medication_id: medications[i]._id,
        farmer_id: farmer_id,
      });
      await createAdminMed(newMedAdmin, farmer_id);
    }
    return "AdminMeds added";
  } catch (err) {
    console.log(err);
    return "there was an error";
  }
}
async function populateAll(parent, args, context) {
  try {
    await populateAnimals(parent, args, context);
    await populateMedications(parent, args, context);
    await populateAdminMeds(parent, args, context);
  } catch (err) {
    return "Something went wrong";
  }
  return "Finished Populating";
}
async function deleteAllFarmerInfo(parent, args, context) {
  try {
    const farmer_id = getUserId(context);
    if (farmer_id) {
      const animals = await Animal.find({ farmer_id: farmer_id });
      const medications = await Medication.find({ farmer_id: farmer_id });
      const AdminMeds = await MedicationAdministration.find({
        farmer_id: farmer_id,
      });
      const groups = await Group.find({ farmer_id: farmer_id });
      for (var i = 0; i < animals.length; i++) {
        await Animal.findByIdAndDelete(animals[i]._id);
      }
      for (var i = 0; i < medications.length; i++) {
        await Medication.findByIdAndDelete(medications[i]._id);
      }
      for (var i = 0; i < groups.length; i++) {
        await Group.findByIdAndDelete(groups[i]._id);
      }
      for (var i = 0; i < AdminMeds.length; i++) {
        await MedicationAdministration.findByIdAndDelete(AdminMeds[i]._id);
      }
    }
    return "'What did it cost?'-you. 'Everything'-me";
  } catch (err) {
    console.log(err);
    return "there was an error";
  }
}
module.exports = {
  signUp,
  login,
  passwordResetAndLogin,
  updateFarmer,
  populateAnimals,
  populateMedications,
  populateAdminMeds,
  populateAll,
  deleteAllFarmerInfo,
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
