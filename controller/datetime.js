
const getCurrentDateTime = () => {
  const now = new Date();
  
  // Add IST offset (5 hours and 30 minutes) to the UTC time
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + istOffset);

  const year = istTime.getFullYear();
  const month = String(istTime.getMonth() + 1).padStart(2, "0"); 
  const day = String(istTime.getDate()).padStart(2, "0");

  const hours = String(istTime.getHours()).padStart(2, "0");
  const minutes = String(istTime.getMinutes()).padStart(2, "0");
  const seconds = String(istTime.getSeconds()).padStart(2, "0");
  const milliseconds = String(istTime.getMilliseconds()).padStart(3, "0");

  const formattedDate = `${year}-${month}-${day}`;
  const formattedTime = `${hours}:${minutes}:${seconds}:${milliseconds}`;

  return { date: formattedDate, time: formattedTime };
};

// Test the function



module.exports=getCurrentDateTime
