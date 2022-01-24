const { getUserId, errorConstructor } = require("../../utils");
const Animal = require("../../models/animals");
const User = require("../../models/user");
const {
    FAILED_AUTHENTICATION,
    OPERATION_SUCCESSFUL,
    ALREADY_EXISTS,
    OPERATION_FAILED,
    INCORRECT_MOTHER,
    INCORRECT_SIRE,
    INCORRECT_PARENTS,
  } = require("../ResolverErrorMessages");

  function userHerdNo(id) {
    return User.findById(id).select({ herd_number: 1, _id: 0 });
  }
  async function addLastCalvedToDam(dam_no, user_id, date) {
    const dam_id = await Animal.findOne({
      tag_number: dam_no,
      user_id: user_id,
    }).select({ _id: 1 });
    if (dam_id) {
      await Animal.findByIdAndUpdate({ _id: dam_id._id }, { last_calved: date });
    }
  }
  async function animalParentCheck(user_id, sire_number, mother_number) {
    var sire = await Animal.findOne({
      user_id: user_id,
      tag_number: sire_number,
    }).select({ _id: 0, male_female: 1 });
    var mother = await Animal.findOne({
      user_id: user_id,
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

  async function saveAnimal(parent, args, context) {
    try {
      const user_id = getUserId(context);
      var returnable = { responseCheck: FAILED_AUTHENTICATION };
      if (user_id) {
        if (args._id) {
          returnable = await updateAnimal(args, user_id);
        } else {
          const animal = await Animal.findOne({
            user_id: user_id,
            tag_number: args.tag_number,
            removed: true,
          }).select({ _id: 1 });
          if (animal) {
            args._id = animal._id;
            returnable = await updateAnimal(args, user_id);
          } else {
            returnable = await createAnimal(args, user_id);
          }
        }
      }
      return returnable;
    } catch (err) {
      return { responseCheck: errorConstructor(OPERATION_FAILED, err) };
    }
  }
  async function createAnimal(args, user_id) {
    try {
      const herd_number = await userHerdNo(user_id);
      const parents = await animalParentCheck(
        user_id,
        args.sire_number,
        args.mother_number
      );
      const alreadyExists = await Animal.findOne({
        tag_number: args.tag_number,
        user_id: user_id,
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
            user_id: user_id,
          });
          const valid = await newAnimal.save();
          if (!valid) {
            return { responseCheck: OPERATION_FAILED };
          }
          await addLastCalvedToDam(
            args.mother_number,
            user_id,
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
  async function updateAnimal(args, user_id) {
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
      await addLastCalvedToDam(
        editedAnimal.mother_number,
        user_id,
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

  module.exports = {
    saveAnimal,
    deleteAnimal,
    createAnimal,
};