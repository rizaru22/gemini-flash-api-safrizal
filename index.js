import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import fs from 'fs/promises';
import { GoogleGenAI } from '@google/genai';

const app = express();
const upload = multer();
const apiKey=process.env.GOOGLE_API_KEY;
if (!apiKey) {
    console.error("API key not found. Please set the GOOGLE_API_KEY environment variable.");
    process.exit(1);
}
const ai=new GoogleGenAI({apiKey});

const GEMINI_MODEL='gemini-2.5-flash';
const PORT=process.env.PORT || 3000;

app.use(express.json());
app.listen(PORT, () => {
    console.log(`Server ready on http://localhost:${PORT}`);
});

app.post('/generate-text', async (req, res) => {
    const { prompt } = req.body;
    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents:prompt
            });
            res.status(200).json({ result:response.text });
    } catch (error) {
        console.log(error);
        res.status(500).json({message:error.message});
    }
});

app.post('/generate-image', upload.single('image'), async (req, res) => {
    const { prompt } = req.body;
    const base64Image = req.file.buffer.toString('base64');

    try{
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents:[
                {type:'text', text:prompt},
                {inlineData:{data:base64Image, mimeType:req.file.mimetype}}
            ]
        });
        res.status(200).json({ result:response.text });
    }catch(error){
        console.log(error);
        res.status(500).json({message:error.message});
    }
});
        
app.post('/generate-from-document', upload.single('document'), async (req, res) => {
    const { prompt } = req.body;
    const base64Document = req.file.buffer.toString('base64');
    
    try{
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents:[
                {type:'text', text:prompt??'Tolong buat ringkasan dari dokumen berikut'},
                {inlineData:{data:base64Document, mimeType:req.file.mimetype}}
            ]
        });
        res.status(200).json({ result:response.text });
    }catch(error){
        console.log(error);
        res.status(500).json({message:error.message});
    }
});

app.post('generate-from-audio', upload.single('audio'), async (req, res) => {
    const { prompt } = req.body;
    const base64Audio = req.file.buffer.toString('base64');

    try{
        const response=await ai.models.generateContent({
            model:GEMINI_MODEL,
            contents:[
                {type:'text', text:prompt??'Tolong buatkan transkrip dari rekaman berikut'},
                {inlineData:{data:base64Audio, mimeType:req.file.mimetype}}
            ]
        });
        res.status(200).json({result:response.text});
    }catch(error){  
        console.log(error);
        res.status(500).json({message:error.message})
    }
});


