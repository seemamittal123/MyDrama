import jwt from "jsonwebtoken";

const getToken = async (userId) => {
  try {
    const token = await jwt.sign({ userId }, process.env.JWT_SECRET_KEY, {
      expiresIn: "31d",
    });
    return token;
  } catch (err) {
    console.log(err);
  }
};
export default getToken;
