const Animal = require("../models/animals");
const Farmer = require("../models/farmer");
const Group = require("../models/group");
const Medication = require("../models/medication");
const AdministeredMedication = require("../models/medication_administration");
const Breed = require("../models/breed");
const { getUserId } = require("../utils");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const {
  FAILED_AUTHENTICATION,
  OPERATION_SUCCESSFUL,
  OPERATION_FAILED,
} = require("./ResolverErrorMessages");
//API info
function info() {
  return "This is the OptiFarm API";
}
//User
async function farmer(parent, args, context) {
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    const farmer = await Farmer.findById(farmer_id);
    if (!farmer) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = { responseCheck: OPERATION_SUCCESSFUL, farmer: farmer };
    }
  }
  return returnable;
}
//Animal
async function animal(parent, args, context) {
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    const animal = await Animal.findOne({
      _id: args._id,
      farmer_id: farmer_id,
      removed: { $ne: true },
    });
    if (!animal) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = { responseCheck: OPERATION_SUCCESSFUL, animal: animal };
    }
  }
  return returnable;
}
async function animalWithLastMedication(parent, args, context) {
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    var animalAndAdminMed = await AdministeredMedication.aggregate(
      [
        {
          $match: {
            farmer_id: ObjectId(farmer_id),
            animal_id: ObjectId(args._id),
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
    )
      .sort({ date_of_administration: -1, _id: -1 })
      .limit(1);
    try {
      if (!animalAndAdminMed[0].animal[0]) {
        console.log("How did I get here?");
      }
    } catch (err) {
      animalAndAdminMed = null;
    }
    returnable = {
      responseCheck: OPERATION_SUCCESSFUL,
      administeredMedications: animalAndAdminMed,
    };
  }
  return returnable;
}
async function animalsByName(parent, args, context) {
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    const animal = await Animal.findOne({
      animal_name: { $regex: new RegExp(".*" + args.animal_name + ".*", "i") },
      farmer_id: farmer_id,
      removed: { $ne: true },
    });
    if (!animal) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = { responseCheck: OPERATION_SUCCESSFUL, animal: animal };
    }
  }
  return returnable;
}
async function animalByTag(parent, args, context) {
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    const animal = await Animal.findOne({
      tag_number: args.tag_number,
      farmer_id: farmer_id,
      removed: { $ne: true },
    });
    if (!animal) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = { responseCheck: OPERATION_SUCCESSFUL, animal: animal };
    }
  }
  return returnable;
}
//Animals
async function herd(parent, args, context) {
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    const animals = await Animal.find({
      farmer_id: farmer_id,
      removed: { $ne: true },
    }).sort({ id: -1 });
    if (!animals) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = { responseCheck: OPERATION_SUCCESSFUL, animals: animals };
    }
  }
  return returnable;
}
async function herdCount(parent, args, context) {
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    const count = await Animal.find({
      farmer_id: farmer_id,
      removed: { $ne: true },
    }).countDocuments();
    if (!count) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = { responseCheck: OPERATION_SUCCESSFUL, count };
    }
  }
  return returnable;
}
async function animalByBreed(parent, args, context) {
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    const animals = await Animal.find({
      breed_type: args.breed_type,
      farmer_id: farmer_id,
      removed: { $ne: true },
    });
    if (!animals) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = { responseCheck: OPERATION_SUCCESSFUL, animals: animals };
    }
  }
  return returnable;
}
async function animalsByCrossBreed(parent, args, context) {
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    var animalBreedType = args.breed_type.split("X").join("");
    const animals = await Animal.find({
      breed_type: { $regex: new RegExp(".*" + animalBreedType + ".*?X", "i") },
      farmer_id: farmer_id,
      removed: { $ne: true },
    });
    if (!animals) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = { responseCheck: OPERATION_SUCCESSFUL, animals: animals };
    }
  }
  return returnable;
}
async function animalByPureBreed(parent, args, context) {
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    const animals = await Animal.find({
      pure_breed: args.pure_breed,
      farmer_id: farmer_id,
      removed: { $ne: true },
    });
    if (!animals) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = { responseCheck: OPERATION_SUCCESSFUL, animals: animals };
    }
  }
  return returnable;
}
async function animalBySex(parent, args, context) {
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    const animals = await Animal.find({
      male_female: args.male_female,
      farmer_id: farmer_id,
      removed: { $ne: true },
    });
    if (!animals) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = { responseCheck: OPERATION_SUCCESSFUL, animals: animals };
    }
  }
  return returnable;
}
async function animalByProgeny(parent, args, context) {
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    var animals;
    var parentAnimal = await Animal.find({
      tag_number: args.tag_number,
      farmer_id: farmer_id,
    }).select({ _id: 0, male_female: 1 });
    if (parentAnimal.male_female === "M") {
      animals = await Animal.find({
        sire_number: args.tag_number,
        farmer_id: farmer_id,
        removed: { $ne: true },
        v,
      });
    } else {
      animals = await Animal.find({
        mother_number: args.tag_number,
        farmer_id: farmer_id,
        removed: { $ne: true },
      });
    }
    if (!animals) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = { responseCheck: OPERATION_SUCCESSFUL, animals: animals };
    }
  }
  return returnable;
}
// Animal
async function animalsBornOn(parent, args, context) {
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    const animals = await Animal.find({
      date_of_birth: new Date(args.date_of_birth),
      farmer_id: farmer_id,
      removed: { $ne: true },
    });
    if (!animals) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = { responseCheck: OPERATION_SUCCESSFUL, animals: animals };
    }
  }
  return returnable;
}
async function animalsBornAfter(parent, args, context) {
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    const animals = await Animal.find({
      date_of_birth: { $gte: new Date(args.date_of_birth) },
      farmer_id: farmer_id,
      removed: { $ne: true },
    });
    if (!animals) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = { responseCheck: OPERATION_SUCCESSFUL, animals: animals };
    }
  }
  return returnable;
}
async function animalsBornBefore(parent, args, context) {
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    const animals = await Animal.find({
      date_of_birth: { $lte: new Date(args.date_of_birth) },
      farmer_id: farmer_id,
      removed: { $ne: true },
    });
    if (!animals) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = { responseCheck: OPERATION_SUCCESSFUL, animals: animals };
    }
  }
  return returnable;
}
async function animalsBornBetween(parent, args, context) {
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    const animals = await Animal.find({
      date_of_birth: {
        $gte: new Date(args.after),
        $lte: new Date(args.before),
      },
      farmer_id: farmer_id,
      removed: { $ne: true },
    });
    if (!animals) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = { responseCheck: OPERATION_SUCCESSFUL, animals: animals };
    }
  }
  return returnable;
}
async function animalInAnyGroup(parent, args, context) {
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    const animals = await Animal.find({
      groups_id: { $exists: true, $not: { $size: 0 } },
      farmer_id: farmer_id,
      removed: { $ne: true },
    });
    if (!animals) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = { responseCheck: OPERATION_SUCCESSFUL, animals: animals };
    }
  }
  return returnable;
}
async function animalsInGroup(parent, args, context) {
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    const animals = await Animal.find({
      groups_id: args.groups_id,
      farmer_id: farmer_id,
      removed: { $ne: true },
    });
    if (!animals) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = { responseCheck: OPERATION_SUCCESSFUL, animals: animals };
    }
  }
  return returnable;
}
async function animalsInGroupCount(parent, args, context) {
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    const count = await Animal.find({
      groups_id: args.groups_id,
      farmer_id: farmer_id,
      removed: { $ne: true },
    }).countDocuments();
    if (!count) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = { responseCheck: OPERATION_SUCCESSFUL, count };
    }
  }
  return returnable;
}
//Group
async function group(parent, args, context) {
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    const group = await Group.findOne({ _id: args._id, farmer_id: farmer_id });
    if (!group) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = { responseCheck: OPERATION_SUCCESSFUL, group: group };
    }
  }
  return returnable;
}
async function groups(parent, args, context) {
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    const groups = await Group.find({ farmer_id: farmer_id });
    if (!groups) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = { responseCheck: OPERATION_SUCCESSFUL, groups: groups };
    }
  }
  return returnable;
}
async function groupByName(parent, args, context) {
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    const groups = await Group.find({
      group_name: args.group_name,
      farmer_id: farmer_id,
    });
    if (!groups) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = { responseCheck: OPERATION_SUCCESSFUL, groups: groups };
    }
  }
  return returnable;
}
async function groupByDescription(parent, args, context) {
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    const groups = await Group.find({
      group_description: args.group_description,
      farmer_id: farmer_id,
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
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    const medication = await Medication.findOne({
      _id: args._id,
      farmer_id: farmer_id,
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
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    const medications = await Medication.find({ farmer_id: farmer_id }).sort({
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
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    const medications = await Medication.aggregate([
      { $match: { farmer_id: ObjectId(farmer_id) } },
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
async function medicationsSortAndLimitTo4(parent, args, context) {
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    const medications = await Medication.find({ farmer_id: farmer_id })
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
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    const medications = await Medication.find({
      medicine_type: args.medicine_type,
      farmer_id: farmer_id,
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
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    const medications = await Medication.find({
      remaining_quantity: { $lte: args.remaining_quantity },
      farmer_id: farmer_id,
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
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    const medications = await Medication.find({
      remaining_quantity: { $gte: args.remaining_quantity },
      farmer_id: farmer_id,
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
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    const medications = await Medication.find({
      expiry_date: { $lt: Date.now() },
      farmer_id: farmer_id,
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
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    var str = args.medication_name;
    const medications = await Medication.find({
      medication_name: { $regex: new RegExp(".*" + str + ".*", "i") },
      farmer_id: farmer_id,
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
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    const administeredMedication = await AdministeredMedication.findOne({
      _id: args._id,
      farmer_id: farmer_id,
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
async function administeredMedications(parent, args, context) {
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    const administeredMedications = await AdministeredMedication.aggregate(
      [
        { $match: { farmer_id: ObjectId(farmer_id) } },
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
    ).sort({ date_of_administration: -1 });
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
async function medicationsLastThreeUsed(parent, args, context) {
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    const administeredMedications = await AdministeredMedication.find({
      farmer_id: farmer_id,
    })
      .select({ date_of_administration: 1, _id: 1, medication_id: 1 })
      .sort({ date_of_administration: -1, _id: -1 })
      .limit(3);
    if (administeredMedications.length != 0) {
      var medications = [3];
      for (var i = 0; i < administeredMedications.length; i++) {
        medications[i] = await Medication.findOne({
          _id: administeredMedications[i].medication_id,
          farmer_id: farmer_id,
        });
      }
    } else {
      medications = await Medication.find({ farmer_id: farmer_id })
        .sort({ purchase_date: -1 })
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
async function administeredMedicationOnDate(parent, args, context) {
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    const administeredMedications = await AdministeredMedication.find({
      date_of_administration: args.date_of_administration,
      farmer_id: farmer_id,
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
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    const administeredMedications = await AdministeredMedication.find({
      animal_id: args.animal_id,
      farmer_id: farmer_id,
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
// Breeds
async function breedName(parent, args, context) {
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  var str = args.breed_name;
  const breed_name = await Breed.find({
    breed_name: { $regex: new RegExp(".*" + str + ".*", "i") },
  });
  if (!breed_name) {
    returnable = { responseCheck: OPERATION_FAILED };
  } else {
    returnable = {
      responseCheck: OPERATION_SUCCESSFUL,
      breed: breed_name,
    };
  }
  return returnable;
}
async function breedCode(parent, args, context) {
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  var str = args.breed_code;
  if (farmer_id) {
    const breed_code = await Breed.find({
      breed_code: { $regex: new RegExp(".*" + str + ".*", "i") },
    });
    if (!breed_code) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = {
        responseCheck: OPERATION_SUCCESSFUL,
        breed: breed_code,
      };
    }
  }
  return returnable;
}
async function breed(parent, args, context) {
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    const breed_code = await Breed.findById({ _id: args._id });
    if (!breed_code) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = {
        responseCheck: OPERATION_SUCCESSFUL,
        breed: breed_code,
      };
    }
  }
  return returnable;
}
module.exports = {
  info,
  farmer,
  // Animal
  animal,
  animalWithLastMedication,
  animalsByName,
  animalByTag,
  herd,
  herdCount,
  animalByBreed,
  animalByPureBreed,
  animalBySex,
  animalByProgeny,
  animalsBornOn,
  animalsBornAfter,
  animalsBornBefore,
  animalsBornBetween,
  animalsByCrossBreed,
  animalInAnyGroup,
  animalsInGroup,
  animalsInGroupCount,
  // Group
  group,
  groups,
  groupByName,
  groupByDescription,
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
  administeredMedications,
  administeredMedicationOnDate,
  administeredMedicationsByAnimal,
  medicationsLastThreeUsed,
  // Breed
  breed,
  breedName,
  breedCode,
};
