const { getUserId, errorConstructor } = require("../../utils");
const Medication = require("../../models/medication");
const {
    FAILED_AUTHENTICATION,
    OPERATION_SUCCESSFUL,
    OPERATION_FAILED,
  } = require("../ResolverErrorMessages");

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
    saveAdminMed,
    deleteAdministeredMedication,
    deleteMedAdministrator,
};