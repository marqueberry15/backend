const getCurrentDateTime = () => {
  const now = new Date();

  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Kolkata", 
  };

  const formattedDateTime = now.toLocaleString("en-IN", options);

  return formattedDateTime;
};

module.exports=getCurrentDateTime
