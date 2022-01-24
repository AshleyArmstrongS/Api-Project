const AdministeredMedication = require("../models/medication_administration");
const { getUserId } = require("../utils");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const {
  FAILED_AUTHENTICATION,
  OPERATION_SUCCESSFUL,
  OPERATION_FAILED,
} = require("./ResolverErrorMessages");
//User
const { info, user } = require("./Queries/User");
//Animal
const {
  animal,
  animalWithLastMedication,
  animalByTag,
  herd,
  herdCount,
  animalBySex,
  animalByProgeny,
  animalInAnyGroup,
  animalsInGroup,
  animalsInGroupCount,
} = require("./Queries/Animals");
//Group
const { group, groups, groupByName } = require("./Queries/Groups");
//Medication
const {
  medication,
  medications,
  medicationsOld,
  medicationsSortAndLimitTo4,
  medicationsByType,
  medicationsByRemainingQtyLessThan,
  medicationsByRemainingQtyGreaterThan,
  medicationsExpired,
  medicationsByName,
  medicationsLastThreeUsed,
} = require("./Queries/Medication");
// Medical_Administration
async function administeredMedication(parent, args, context) {
  const user_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (user_id) {
    const administeredMedication = await AdministeredMedication.findOne({
      _id: args._id,
      user_id: user_id,
    });
    if (!administeredMedication) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = {
        responseCheck: OPERATION_SUCCESSFUL,
        administeredMedication: administeredMedication,
      };
    }
  }
  return returnable;
}
async function administeredMedicationsActiveWithdrawalByMedication(
  parent,
  args,
  context
) {
  const user_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (user_id) {
    var today = new Date();
    const date =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate();
    var administeredMedication = await AdministeredMedication.aggregate(
      [
        {
          $match: {
            $or: [
              { withdrawal_end_meat: { $gt: today } },
              { withdrawal_end_dairy: { $gt: today } },
            ],
            user_id: ObjectId(user_id),
            medication_id: ObjectId(args.medication_id),
          },
        },
        {
          $lookup: {
            from: "medication",
            localField: "medication_id",
            foreignField: "_id",
            as: "medication",
          },
        },
        {
          $lookup: {
            from: "animals",
            localField: "animal_id",
            foreignField: "_id",
            as: "animal",
          },
        },
      ],
      function (err, res) {
        if (err) {
          return { responseCheck: OPERATION_FAILED + " " + err.toString() };
        }
      }
    ).sort({ date_of_administration: -1, _id: 1 });
    try {
      if (!administeredMedication) {
        console.log("How did I get here?");
      }
    } catch (err) {
      animalAndAdminMed = null;
    }
    returnable = {
      responseCheck: OPERATION_SUCCESSFUL,
      administeredMedications: administeredMedication,
    };
  }
  return returnable;
}
async function administeredMedicationsActiveWithdrawalByAnimal(
  parent,
  args,
  context
) {
  const user_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (user_id) {
    var today = new Date();
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
    var administeredMedication = await AdministeredMedication.aggregate(
      [
        {
          $match: {
            $or: [
              { withdrawal_end_meat: { $gt: today } },
              { withdrawal_end_dairy: { $gt: today } },
            ],
            user_id: ObjectId(user_id),
            animal_id: ObjectId(args.animal_id),
          },
        },
        {
          $lookup: {
            from: "medication",
            localField: "medication_id",
            foreignField: "_id",
            as: "medication",
          },
        },
        {
          $lookup: {
            from: "animals",
            localField: "animal_id",
            foreignField: "_id",
            as: "animal",
          },
        },
      ],
      function (err, res) {
        if (err) {
          return { responseCheck: OPERATION_FAILED + " " + err.toString() };
        }
      }
    ).sort({ date_of_administration: -1, _id: 1 });
    try {
      if (!administeredMedication) {
        console.log("How did I get here?");
      }
    } catch (err) {
      animalAndAdminMed = null;
    }
    returnable = {
      responseCheck: OPERATION_SUCCESSFUL,
      administeredMedications: administeredMedication,
    };
  }
  return returnable;
}
async function administeredMedications(parent, args, context) {
  const user_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (user_id) {
    const administeredMedications = await AdministeredMedication.aggregate(
      [
        { $match: { user_id: ObjectId(user_id) } },
        {
          $lookup: {
            from: "medication",
            localField: "medication_id",
            foreignField: "_id",
            as: "medication",
          },
        },
        {
          $lookup: {
            from: "animals",
            localField: "animal_id",
            foreignField: "_id",
            as: "animal",
          },
        },
      ],
      function (err, res) {
        if (err) {
          return { responseCheck: OPERATION_FAILED + " " + err.toString() };
        }
      }
    ).sort({ date_of_administration: -1, _id: -1 });
    if (!administeredMedications) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = {
        responseCheck: OPERATION_SUCCESSFUL,
        administeredMedications: administeredMedications,
      };
    }
  }
  return returnable;
}
async function administeredMedicationOnDate(parent, args, context) {
  const user_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (user_id) {
    const administeredMedications = await AdministeredMedication.find({
      date_of_administration: args.date_of_administration,
      user_id: user_id,
    });
    if (!administeredMedications) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = {
        responseCheck: OPERATION_SUCCESSFUL,
        administeredMedications: administeredMedications,
      };
    }
  }
  return returnable;
}
async function administeredMedicationsByAnimal(parent, args, context) {
  const user_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (user_id) {
    const administeredMedications = await AdministeredMedication.find({
      animal_id: args.animal_id,
      user_id: user_id,
    });
    if (!administeredMedications) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = {
        responseCheck: OPERATION_SUCCESSFUL,
        administeredMedications: administeredMedications,
      };
    }
  }
  return returnable;
}
module.exports = {
  info,
  user,
  // Animal
  animal,
  animalWithLastMedication,
  animalByTag,
  herd,
  herdCount,
  animalBySex,
  animalByProgeny,
  animalInAnyGroup,
  animalsInGroup,
  animalsInGroupCount,
  // Group
  group,
  groups,
  groupByName,
  // Medication
  medication,
  medications,
  medicationsOld,
  medicationsSortAndLimitTo4,
  medicationsByType,
  medicationsByRemainingQtyLessThan,
  medicationsByRemainingQtyGreaterThan,
  medicationsExpired,
  medicationsByName,
  medicationsLastThreeUsed,
  // AdministeredMedication
  administeredMedication,
  administeredMedicationsActiveWithdrawalByMedication,
  administeredMedicationsActiveWithdrawalByAnimal,
  administeredMedications,
  administeredMedicationOnDate,
  administeredMedicationsByAnimal,
};
