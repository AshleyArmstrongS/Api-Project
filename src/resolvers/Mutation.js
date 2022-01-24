const { getUserId} = require("../utils");
const Animal = require("../models/animals");
const Farmer = require("../models/user");
const Medication = require("../models/medication");
const Group = require("../models/group");
const MedicationAdministration = require("../models/medication_administration");
const {
  FAILED_AUTHENTICATION,
  OPERATION_SUCCESSFUL,
  ALREADY_EXISTS,
  OPERATION_FAILED,
} = require("./ResolverErrorMessages");

//Internal functions

async function checkMedicationAvailability(id, quantity_used) {
  const available = await Medication.findById(id).select({
    remaining_quantity: 1,
    quantity_type: 1,
    withdrawal_days_meat: 1,
    withdrawal_days_dairy: 1,
    _id: 0,
  });
  if (available.remaining_quantity >= quantity_used) {
    return available;
  }
  return false;
}
function addDays(date, days) {
  const copy = new Date(Number(date));
  copy.setDate(date.getDate() + days);
  return copy;
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

//Login/SignUp
const {signUp, login, updateUser, passwordResetAndLogin, } = require("./Mutations/User");
//Animal Mutations
const {deleteAnimal, saveAnimal,} = require("./Mutations/Animals");
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
      return { responseCheck: FAILED_AUTHENTICATION };
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
      var meat = new Date(args.date_of_administration);
      meat = addDays(meat, available.withdrawal_days_meat);
      var dairy = new Date(args.date_of_administration);
      dairy = addDays(dairy, available.withdrawal_days_dairy);
      const newMedAdmin = new MedicationAdministration({
        date_of_administration: args.date_of_administration,
        quantity_administered: args.quantity_administered,
        quantity_type: available.quantity_type,
        withdrawal_end_meat: meat,
        withdrawal_end_dairy: dairy,
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
    const responseCheck = { success: false, message: message };
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

module.exports = {
  signUp,
  login,
  passwordResetAndLogin,
  updateUser,
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
};
