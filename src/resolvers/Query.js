const User = require("../models/user");
const Group = require("../models/group");
const Medication = require("../models/medication");
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
const {info, user, } = require("./Queries/User")
//Animal
const {  animal, animalWithLastMedication, animalByTag, herd, herdCount, animalBySex, animalByProgeny, animalInAnyGroup, animalsInGroup, animalsInGroupCount,} = require("./Queries/Animals")
//Group
async function group(parent, args, context) {
  const user_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (user_id) {
    const group = await Group.findOne({ _id: args._id, user_id: user_id });
    if (!group) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = { responseCheck: OPERATION_SUCCESSFUL, group: group };
    }
  }
  return returnable;
}
async function groups(parent, args, context) {
  const user_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (user_id) {
    const groups = await Group.find({ user_id: user_id });
    if (!groups) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = { responseCheck: OPERATION_SUCCESSFUL, groups: groups };
    }
  }
  return returnable;
}
async function groupByName(parent, args, context) {
  const user_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (user_id) {
    const groups = await Group.find({
      group_name: args.group_name,
      user_id: user_id,
    });
    if (!groups) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = { responseCheck: OPERATION_SUCCESSFUL, groups: groups };
    }
  }
  return returnable;
}
//Medication
async function medication(parent, args, context) {
  const user_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (user_id) {
    const medication = await Medication.findOne({
      _id: args._id,
      user_id: user_id,
    });
    if (!medication) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = {
        responseCheck: OPERATION_SUCCESSFUL,
        medication: medication,
      };
    }
  }
  return returnable;
}
//Medications
async function medicationsOld(parent, args, context) {
  const user_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (user_id) {
    const medications = await Medication.find({ user_id: user_id }).sort({
      purchase_date: -1,
      remaining_quantity: -1,
    });
    if (!medications) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = {
        responseCheck: OPERATION_SUCCESSFUL,
        medications: medications,
      };
    }
  }
  return returnable;
}
async function medications(parent, args, context) {
  const user_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (user_id) {
    const medications = await Medication.aggregate([
      { $match: { user_id: ObjectId(user_id) } },
      {
        $project: {
          _id: 1,
          medication_name: 1,
          supplied_by: 1,
          quantity: 1,
          medicine_type: 1,
          quantity_type: 1,
          withdrawal_days_meat: 1,
          withdrawal_days_dairy: 1,
          remaining_quantity: 1,
          batch_number: 1,
          expiry_date: 1,
          purchase_date: 1,
          comments: 1,
          sort: {
            $cond: {
              if: {
                $eq: ["$remaining_quantity", 0],
              },
              then: "$remaining_quantity",
              else: "$purchase_date",
            },
          },
        },
      },
      {
        $sort: {
          sort: 1,
        },
      },
    ]);
    if (!medications) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = {
        responseCheck: OPERATION_SUCCESSFUL,
        medications: medications.reverse(),
      };
    }
  }
  return returnable;
}
async function medicationsLastThreeUsed(parent, args, context) {
  const user_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (user_id) {
    const administeredMedications = await AdministeredMedication.aggregate([
      { $match: { user_id: ObjectId(user_id) } },
      {
        $group: { _id: "$medication_id" },
      },
      {
        $lookup: {
          from: "medication",
          localField: "_id",
          foreignField: "_id",
          as: "medication",
        },
      },
    ])
      .sort({ date_of_administration: -1, _id: -1 })
      .limit(3);
    var medications = [];
    if (administeredMedications.length != 0) {
      for (var i = 0; i < administeredMedications.length; i++) {
        medications[i] = administeredMedications[i].medication[0];
      }
    } else {
      medications = await Medication.find({ user_id: user_id })
        .sort({ purchase_date: -1, _id: -1 })
        .limit(3);
    }
    if (!medications) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = {
        responseCheck: OPERATION_SUCCESSFUL,
        medications: medications,
      };
    }
  }
  return returnable;
}
async function medicationsSortAndLimitTo4(parent, args, context) {
  const user_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (user_id) {
    const medications = await Medication.find({ user_id: user_id })
      .sort({ remaining_quantity: 1 })
      .limit(4);
    if (!medications) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = {
        responseCheck: OPERATION_SUCCESSFUL,
        medications: medications,
      };
    }
  }
  return returnable;
}
async function medicationsByType(parent, args, context) {
  const user_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (user_id) {
    const medications = await Medication.find({
      medicine_type: args.medicine_type,
      user_id: user_id,
    });
    if (!medications) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = {
        responseCheck: OPERATION_SUCCESSFUL,
        medications: medications,
      };
    }
  }
  return returnable;
}
async function medicationsByRemainingQtyLessThan(parent, args, context) {
  const user_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (user_id) {
    const medications = await Medication.find({
      remaining_quantity: { $lte: args.remaining_quantity },
      user_id: user_id,
    }).limit(4);
    if (!medications) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = {
        responseCheck: OPERATION_SUCCESSFUL,
        medications: medications,
      };
    }
  }
  return returnable;
}
async function medicationsByRemainingQtyGreaterThan(parent, args, context) {
  const user_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (user_id) {
    const medications = await Medication.find({
      remaining_quantity: { $gte: args.remaining_quantity },
      user_id: user_id,
    }).limit(4);
    if (!medications) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = {
        responseCheck: OPERATION_SUCCESSFUL,
        medications: medications,
      };
    }
  }
  return returnable;
}
async function medicationsExpired(parent, args, context) {
  const user_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (user_id) {
    const medications = await Medication.find({
      expiry_date: { $lt: Date.now() },
      user_id: user_id,
    });
    if (!medications) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = {
        responseCheck: OPERATION_SUCCESSFUL,
        medications: medications,
      };
    }
  }
  return returnable;
}
async function medicationsByName(parent, args, context) {
  const user_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (user_id) {
    var str = args.medication_name;
    const medications = await Medication.find({
      medication_name: { $regex: new RegExp(".*" + str + ".*", "i") },
      user_id: user_id,
    });
    if (!medications) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = {
        responseCheck: OPERATION_SUCCESSFUL,
        medications: medications,
      };
    }
  }
  return returnable;
}
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
async function administeredMedicationsActiveWithdrawalByMedication(parent, args, context) {
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
async function administeredMedicationsActiveWithdrawalByAnimal(parent, args, context) {
  const user_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (user_id) {
    var today = new Date();
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
  // AdministeredMedication
  administeredMedication,
  administeredMedicationsActiveWithdrawalByMedication,
  administeredMedicationsActiveWithdrawalByAnimal,
  administeredMedications,
  administeredMedicationOnDate,
  administeredMedicationsByAnimal,
  medicationsLastThreeUsed,
};
