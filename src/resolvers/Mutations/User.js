const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getUserId, errorConstructor } = require("../../utils");
const { APP_SECRET } = require("../../Config");
const User = require("../../models/user");
const {
  OPERATION_SUCCESSFUL,
  ALREADY_EXISTS,
  OPERATION_FAILED,
  NO_SUCH_EMAIL,
  INCORRECT_PASSWORD,
  PASSWORD_RESET_FAILED,
} = require("../ResolverErrorMessages");

  async function signUp(parent, args) {
    try {
      const alreadyExists = await User.findOne({ email: args.email });
      if (alreadyExists) {
        return { responseCheck: ALREADY_EXISTS };
      }
      const password = await bcrypt.hash(args.password, 10);
      const med_administrator = args.first_name + " " + args.second_name;
      const newUser = new User({
        first_name: args.first_name,
        second_name: args.second_name,
        farm_type: args.farm_type,
        farm_address: args.farm_address ?? null,
        password: password,
        medication_administrators: med_administrator,
        email: args.email,
        herd_number: args.herd_number,
      });
      const valid = await newUser.save();
      if (!valid) {
        return { responseCheck: OPERATION_FAILED };
      }
      const userToken = jwt.sign({ userId: newUser._id }, APP_SECRET);
      return {
        responseCheck: OPERATION_SUCCESSFUL,
        token: userToken,
        user: newUser,
      };
    } catch (err) {
      return { responseCheck: errorConstructor(OPERATION_FAILED, err) };
    }
  }
  async function login(parent, args) {
    try {
      console.log(args)
      const loggingInUser = await User.findOne({ email: args.email });
      if (!loggingInUser) {
        return { responseCheck: NO_SUCH_EMAIL };
      }
      const valid = await bcrypt.compare(args.password, loggingInUser.password);
      if (!valid) {
        return { responseCheck: INCORRECT_PASSWORD };
      }
      const userToken = jwt.sign({ userId: loggingInUser._id }, APP_SECRET);
      return {
        responseCheck: OPERATION_SUCCESSFUL,
        token: userToken,
        user: loggingInUser,
      };
    } catch (err) {
      return { responseCheck: errorConstructor(OPERATION_FAILED, err) };
    }
  }
  async function passwordResetAndLogin(parent, args) {
    try {
      const userToBeChanged = await User.findOne({ email: args.email });
      const valid = await bcrypt.compare(
        args.password,
        userToBeChanged.password
      );
      var success = false;
      if (valid) {
        const new_password = await bcrypt.hash(args.new_password, 10);
        success = await User.findByIdAndUpdate(
          { _id: userToBeChanged._id },
          { password: new_password }
        );
      } else {
        return { responseCheck: INCORRECT_PASSWORD };
      }
      if (success) {
        const updated = await User.findOne({ email: args.email }).select({
          password: 0,
        });
        const userToken = jwt.sign({ userId: updated._id }, APP_SECRET);
        return {
          responseCheck: OPERATION_SUCCESSFUL,
          token: userToken,
          user: updated,
        };
      }
      return { responseCheck: PASSWORD_RESET_FAILED };
    } catch (err) {
      return { responseCheck: errorConstructor(OPERATION_FAILED, err) };
    }
  }
  async function updateUser(parent, args, context) {
    try {
      const user_id = getUserId(context);
      const userToBeChanged = await User.findById(user_id).select({
        password: 0,
      });
      const success = await User.findByIdAndUpdate(
        { _id: userToBeChanged._id },
        {
          first_name: args.first_name ?? userToBeChanged.first_name,
          second_name: args.second_name ?? userToBeChanged.second_name,
          farm_address: args.farm_address ?? userToBeChanged.farm_address,
          farm_type: args.farm_type ?? userToBeChanged.farm_type,
        }
      );
      if (success) {
        const updated = await User.findById(user_id).select({
          password: 0,
        });
        return {
          responseCheck: OPERATION_SUCCESSFUL,
          user: updated,
        };
      }
      return { responseCheck: PASSWORD_RESET_FAILED };
    } catch (err) {
      return { responseCheck: errorConstructor(OPERATION_FAILED, err) };
    }
  }
  module.exports = {
    signUp,
    login,
    passwordResetAndLogin,
    updateUser,
  };