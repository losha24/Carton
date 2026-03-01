// ⚠ שמור מפתח זה במקום בטוח ולא בקוד ציבורי
// 'YOUR_OPENAI_API_KEY' הוא placeholder
const OPENAI_API_KEY = "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";

async function createImageOpenAI(name,type,description){
    const prompt = `${name}, ${type}, ${description}, detailed, high quality`;
    const res = await fetch("https://api.openai.com/v1/images/generations",{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            "Authorization":"Bearer " + OPENAI_API_KEY
        },
        body: JSON.stringify({
            model:"gpt-image-1",
            prompt: prompt,
            size:"512x512"
        })
    });
    const data = await res.json();
    if(data.data && data.data[0] && data.data[0].url){
        return data.data[0].url;
    } else {
        throw new Error("לא ניתן ליצור תמונה");
    }
}
