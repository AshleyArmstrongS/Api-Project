const Animal = require("../models/animals");
const Farmer = require("../models/farmer");
const Group = require("../models/group");
const Medication = require("../models/medication");
const AdministeredMedication = require("../models/medication_administration");
const Breed = require("../models/breed");
const { getUserId } = require("../utils");
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
    const animal = await Animal.findOne({ _id: args.id, farmer_id: farmer_id });
    if (!animal) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = { responseCheck: OPERATION_SUCCESSFUL, animal: animal };
    }
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
    const animals = await Animal.find({ farmer_id: farmer_id });
    if (!animals) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = { responseCheck: OPERATION_SUCCESSFUL, animals: animals };
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
      breed_type: args.breed_type,
      farmer_id: farmer_id,
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
    const animals = new Animal();
    if (args.male_female == "M") {
      animals = await Animal.find({
        sire_number: args.tag_number,
        farmer_id: farmer_id,
      });
    } else {
      animals = await Animal.find({
        mother_number: args.tag_number,
        farmer_id: farmer_id,
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
    });
    if (!animals) {
      returnable = { responseCheck: OPERATION_FAILED };
    } else {
      returnable = { responseCheck: OPERATION_SUCCESSFUL, animals: animals };
    }
  }
  return returnable;
}

//Group
async function group(parent, args, context) {
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    const group = await Group.findOne({ _id: args.id, farmer_id: farmer_id });
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

//Medication
async function medication(parent, args, context) {
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    const medication = await Medication.findOne({
      _id: args.id,
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
async function medications(parent, args, context) {
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    const medications = await Medication.find({ farmer_id: farmer_id });
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
      _id: args.id,
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
    const administeredMedications = await AdministeredMedication.find({
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
// need to look at this again, thinking of adding complexity to it but will have to do some research first
async function administeredMedicationOnDate(parent, args, context) {
  const farmer_id = getUserId(context);
  var returnable = { responseCheck: FAILED_AUTHENTICATION };
  if (farmer_id) {
    const administeredMedications = await AdministeredMedication.find({
      date_of_administration: args.date_of_administration,
      farmer_id: id,
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
function breedName(parent, args) {
  return Breed.find({ breed_name: args.breed_name });
}
function breedCode(parent, args) {
  return Breed.find({ breed_code: args.breed_code });
}

module.exports = {
  info,
  farmer,
  // Animal
  animal,
  animalsByName,
  animalByTag,
  herd,
  animalByBreed,
  animalByPureBreed,
  animalBySex,
  animalByProgeny,
  animalsBornOn,
  animalsBornAfter,
  animalsBornBefore,
  animalsBornBetween,
  animalsByCrossBreed,
  animalsInGroup,
  // Group
  group,
  groups,
  groupByName,
  groupByDescription,
  // Medication
  medication,
  medications,
  medicationsExpired,
  medicationsByName,
  // AdministeredMedication
  administeredMedication,
  administeredMedications,
  administeredMedicationOnDate,

  // Breed
  breedName,
  breedCode,
};
