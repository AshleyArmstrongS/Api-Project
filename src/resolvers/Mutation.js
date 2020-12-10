const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { APP_SECRET, FAILED_AUTHENTICATION, getUserId } = require("../utils");
const { animalByTag } = require("./Query");
const Animal = require("../models/animals");
const Farmer = require("../models/farmer");
const Medication = require("../models/medication");
const Group = require("../models/group");
const MedicationAdministration = require("../models/medication_administration");
const { findById } = require("../models/animals");
//Internal functions
function farmerHerdNo(id) {
  return Farmer.findById(id).select({ herd_number: 1, _id: 0 });
}
async function checkMedicationAvailability(id, quantity_used) {
  const available = await Medication.findById(id);
  if (available.remaining_quantity >= quantity_used) {
    return available.quantity_type;
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
//Login/SignUp
async function signUp(parent, args) {
  const alreadyExists = await Farmer.findOne({ email: args.email });
  if (alreadyExists) {
    return {
      code: 400,
      success: false,
      message:
        "Sign Up failed, email " +
        alreadyExists.email +
        " already has an account.",
    };
  }
  const password = await bcrypt.hash(args.password, 10);
  const newFarmer = await new Farmer({
    first_name: args.first_name,
    second_name: args.second_name,
    farm_type: args.farm_type,
    farm_address: args.farm_address,
    password: password,
    email: args.email,
    herd_number: args.herd_number,
  });
  const valid = await newFarmer.save();
  if (!valid) {
    return { code: 400, success: false, message: "Sign Up failed." };
  }
  const userToken = jwt.sign({ newFarmer: newFarmer._id }, APP_SECRET);
  return {
    code: 201,
    success: true,
    message: "Signed Up successfully.",
    token: userToken,
    farmer: newFarmer,
  };
}
async function login(parent, args) {
  const loggingInFarmer = await Farmer.findOne({ email: args.email });
  if (!loggingInFarmer) {
    const AuthPayLoad = {
      code: 400,
      success: false,
      message: "Email doesn't exist.",
    };
    return AuthPayLoad;
  }
  const valid = await bcrypt.compare(args.password, loggingInFarmer.password);
  if (!valid) {
    return { code: 400, success: false, message: "Password Incorrect." };
  }
  const userToken = jwt.sign({ userId: loggingInFarmer.id }, APP_SECRET);
  return {
    code: 200,
    success: true,
    message: "Logged in successfully.",
    token: userToken,
    farmer: loggingInFarmer,
  };
}
//Animal Mutations
async function createAnimal(parent, args, context) {
  const id = getUserId(context);
  if (!id) {
    return FAILED_AUTHENTICATION;
  }
  const herd_number = await farmerHerdNo(id);
  const alreadyExists = await animalByTag(parent, args, context);
  if (!alreadyExists) {
    const newAnimal = new Animal({
      tag_number: args.tag_number,
      herd_number: herd_number.herd_number,
      sire_number: args.sire_number,
      mother_number: args.mother_number,
      male_female: args.male_female,
      breed_type: args.breed_type,
      date_of_birth: args.date_of_birth,
      pure_breed: args.pure_breed,
      animal_name: args.animal_name,
      description: args.description,
      farmer_id: id,
    });
    const valid = await newAnimal.save();
    if (!valid) {
      return { code: 400, success: false, message: "Animal not created" };
    }
    return {
      code: 201,
      success: true,
      message: "Animal created successful",
      animal: newAnimal,
    };
  }
  return { code: 400, success: false, message: "Animal already exists" };
}
async function updateAnimal(parent, args) {
  const id = getUserId(context);
  if (!id) {
    return FAILED_AUTHENTICATION;
  }
  const valid = await Animal.findByIdAndUpdate(
    { _id: args.id },
    {
      sire_number: args.sire_number,
      mother_number: args.mother_number,
      male_female: args.male_female,
      breed_type: args.breed_type,
      date_of_birth: args.date_of_birth,
      pure_breed: args.pure_breed,
      animal_name: args.animal_name,
      description: args.description,
    }
  );
  if (!valid) {
    return { code: 400, success: false, message: "Animal not updated" };
  }
  const editedAnimal = Animal.findOne({ _id: args.id });
  return {
    code: 200,
    success: true,
    message: "Animal updated successful",
    animal: editedAnimal,
  };
}
async function deleteAnimal(parent, args, context) {
  const id = await getUserId(context);
  if (!id) {
    return FAILED_AUTHENTICATION;
  }
  const valid = await Animal.findByIdAndDelete(args.id);
  if (!valid) {
    return { code: 400, success: false, message: "Animal not deleted" };
  }
  return {
    code: 200,
    success: true,
    message: "Animal deleted successful",
    animal: valid,
  };
}
// Group Mutations
async function createGroup(parent, args, context) {
  const id = getUserId(context);
  if (!id) {
    return FAILED_AUTHENTICATION;
  }
  const newGroup = new Group({
    group_name: args.group_name,
    group_description: args.group_description,
    farmer_id: id,
  });
  const valid = await newGroup.save();
  if (!valid) {
    return { code: 400, success: false, message: "Group not created" };
  }
  return {
    code: 201,
    success: true,
    message: "Group created successful",
    group: newGroup,
  };
}
async function updateGroup(parent, args, context) {
  const id = await getUserId(context);
  if (!id) {
    return FAILED_AUTHENTICATION;
  }
  const valid = await Group.findByIdAndUpdate(
    { _id: args.id },
    {
      group_name: args.group_name,
      group_description: args.group_description,
    }
  );
  if (!valid) {
    return { code: 400, success: false, message: "Group not updated" };
  }
  const editedGroup = Group.findOne({ _id: args.id });
  return {
    code: 200,
    success: true,
    message: "Animal updated successful",
    group: editedGroup,
  };
}
//Medication Mutations
async function createMedication(parent, args, context) {
  const id = getUserId(context);
  if (!id) {
    return FAILED_AUTHENTICATION;
  }
  const newMedication = new Medication({
    medication_name: args.medication_name,
    supplied_by: args.supplied_by,
    quantity: args.quantity,
    quantity_type: args.quantity_type,
    remaining_quantity: args.quantity,
    withdrawal_days_meat: args.withdrawal_days_meat,
    withdrawal_days_dairy: args.withdrawal_days_dairy,
    batch_number: args.batch_number,
    expiry_date: args.expiry_date,
    purchase_date: args.purchase_date,
    comments: args.comments,
    farmer_id: id,
  });
  const valid = await newMedication.save();
  if (!valid) {
    return { code: 400, success: false, message: "Medication not created" };
  }
  return {
    code: 201,
    success: true,
    message: "Medication created successful",
    medication: newMedication,
  };
}
async function updateMedication(parent, args, context) {
  const id = getUserId(context);
  if (!id) {
    return FAILED_AUTHENTICATION;
  }
  const valid = await Medication.findByIdAndUpdate(
    { _id: args.id },
    {
      medication_name: args.medication_name,
      supplied_by: args.supplied_by,
      quantity: args.quantity,
      quantity_type: args.quantity_type,
      withdrawal_days_dairy: args.withdrawal_days_dairy,
      withdrawal_days_meat: args.withdrawal_days_meat,
      remaining_quantity: args.remaining_quantity,
      batch_number: args.batch_number,
      expiry_date: args.expiry_date,
      purchase_date: args.purchase_date,
      comments: args.comments,
    }
  );
  if (!valid) {
    return { code: 400, success: false, message: "Medication not updated" };
  }
  const updatedMedication = await Medication.findOne({ _id: args.id });
  return {
    code: 200,
    success: true,
    message: "Animal updated successful",
    medication: updatedMedication,
  };
}
//MedicationAdministration Mutations
async function administerMedication(parent, args, context) {
  const id = getUserId(context);
  if (!id) {
    return FAILED_AUTHENTICATION;
  }
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
      reason_for_administration: args.reason_for_administration,
      animal_id: args.animal_id,
      medication_id: args.medication_id,
      farmer_id: id,
    });
    const valid = await newMedAdmin.save();
    if (valid) {
      await updateMedicationQuantity(args.medication_id, args.quantity_administered);
      return {
        code: 201,
        success: true,
        message: "Medication administered successful",
        administeredMedication: newMedAdmin,
      };
    }
  } else {
    message = "Medication quantity is to low";
  }
  return {
    code: 400,
    success: false,
    message: message,
  };
}
module.exports = {
  createAnimal,
  signUp,
  login,
  deleteAnimal,
  createGroup,
  updateGroup,
  createMedication,
  updateAnimal,
  updateMedication,
  administerMedication,
};
