//複数セッションを管理するのに使用するコード
export default function joincodeGen(): string {
  const digits = "0123456789";
  const letters = "";
  const possibleChars = digits + letters;
  let code = "";

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * possibleChars.length);
    code += possibleChars[randomIndex];
  }

  return code;
}
