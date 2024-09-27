function generateRandomHex(length = 25, delimiter = "_") {
  const hexDigits = "0123456789abcdef";
  const groupsLength = 5; // Adjust this to change the number of characters per group

  const groups = [];
  for (let i = 0; i < Math.ceil(length / groupsLength); i++) {
    let group = "";
    for (let j = 0; j < groupsLength && i * groupsLength + j < length; j++) {
      group += hexDigits[Math.floor(Math.random() * 16)];
    }
    groups.push(group);
  }

  return groups.join(delimiter);
}

module.exports = { generateRandomHex };
