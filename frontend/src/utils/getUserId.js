// utils/decodeToken.js
export default function  getUserId() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.userId; // ✅ Correct key used in your JWT
  } catch (err) {
    console.error("Invalid token", err);
    return null;
  }
}
