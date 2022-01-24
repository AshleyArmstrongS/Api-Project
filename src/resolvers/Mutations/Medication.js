const { getUserId, errorConstructor } = require("../../utils");
const Medication = require("../../models/medication");
const {
    FAILED_AUTHENTICATION,
    OPERATION_SUCCESSFUL,
    OPERATION_FAILED,
  } = require("../ResolverErrorMessages");
async function saveMedication(parent, args, context) {
    try {
      const user_id = getUserId(context);
      var returnable = { responseCheck: FAILED_AUTHENTICATION };
      if (user_id) {
        if (args._id) {
          returnable = updateMedication(args);
        } else {
          returnable = createMedication(args, user_id);
        }
      }
      return returnable;
    } catch (err) {
      return { responseCheck: errorConstructor(OPERATION_FAILED, err) };
    }
  }
  async function createMedication(args, user_id) {
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
        user_id: user_id,
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

  module.exports = {
    saveMedication,
};