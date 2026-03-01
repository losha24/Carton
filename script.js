async function generateImage() {
  const prompt = document.getElementById("prompt").value;
  const resultDiv = document.getElementById("result");

  resultDiv.innerHTML = "יוצר תמונה...";

  const response = await fetch("/generate-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt })
  });

  const data = await response.json();

  if (data.image) {
    resultDiv.innerHTML = `<img src="${data.image}" />`;
  } else {
    resultDiv.innerHTML = "שגיאה ביצירת תמונה";
  }
}
