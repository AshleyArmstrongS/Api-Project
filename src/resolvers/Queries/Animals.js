const Animal = require("../../models/animals");
const { getUserId } = require("../utils");
async function animal(parent, args, context) {
    const user_id = getUserId(context);
    var returnable = { responseCheck: FAILED_AUTHENTICATION };
    if (user_id) {
      const animal = await Animal.findOne({
        _id: args._id,
        user_id: user_id,
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
    const user_id = getUserId(context);
    var returnable = { responseCheck: FAILED_AUTHENTICATION };
    if (user_id) {
      var animalAndAdminMed = await AdministeredMedication.aggregate(
        [
          {
            $match: {
              user_id: ObjectId(user_id),
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
  async function animalByTag(parent, args, context) {
    const user_id = getUserId(context);
    var returnable = { responseCheck: FAILED_AUTHENTICATION };
    if (user_id) {
      const animal = await Animal.findOne({
        tag_number: args.tag_number,
        user_id: user_id,
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
    const user_id = getUserId(context);
    var returnable = { responseCheck: FAILED_AUTHENTICATION };
    if (user_id) {
      const animals = await Animal.find({
        user_id: user_id,
        removed: { $ne: true },
      }).sort({ id: 1 });
      if (!animals) {
        returnable = { responseCheck: OPERATION_FAILED };
      } else {
        returnable = { responseCheck: OPERATION_SUCCESSFUL, animals: animals };
      }
    }
    return returnable;
  }
  async function herdCount(parent, args, context) {
    const user_id = getUserId(context);
    var returnable = { responseCheck: FAILED_AUTHENTICATION };
    if (user_id) {
      const count = await Animal.find({
        user_id: user_id,
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
  async function animalBySex(parent, args, context) {
    const user_id = getUserId(context);
    var returnable = { responseCheck: FAILED_AUTHENTICATION };
    if (user_id) {
      const animals = await Animal.find({
        male_female: args.male_female,
        user_id: user_id,
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
    const user_id = getUserId(context);
    var returnable = { responseCheck: FAILED_AUTHENTICATION };
    if (user_id) {
      var animals;
      var parentAnimal = await Animal.find({
        tag_number: args.tag_number,
        user_id: user_id,
      }).select({ _id: 0, male_female: 1 });
      if (parentAnimal.male_female === "M") {
        animals = await Animal.find({
          sire_number: args.tag_number,
          user_id: user_id,
          removed: { $ne: true },
          v,
        });
      } else {
        animals = await Animal.find({
          mother_number: args.tag_number,
          user_id: user_id,
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
  async function animalInAnyGroup(parent, args, context) {
    const user_id = getUserId(context);
    var returnable = { responseCheck: FAILED_AUTHENTICATION };
    if (user_id) {
      const animals = await Animal.find({
        groups_id: { $exists: true, $not: { $size: 0 } },
        user_id: user_id,
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
    const user_id = getUserId(context);
    var returnable = { responseCheck: FAILED_AUTHENTICATION };
    if (user_id) {
      const animals = await Animal.find({
        groups_id: args.groups_id,
        user_id: user_id,
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
    const user_id = getUserId(context);
    var returnable = { responseCheck: FAILED_AUTHENTICATION };
    if (user_id) {
      const count = await Animal.find({
        groups_id: args.groups_id,
        user_id: user_id,
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
  module.exports = {
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
  };