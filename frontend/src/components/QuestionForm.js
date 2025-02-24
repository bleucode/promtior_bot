import React, { useState } from 'react';

const QuestionForm = () => {
    const [url, setUrl] = useState('');
    const [pdfFilePath, setPdfFilePath] = useState('');
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        console.log("Submit button clicked, question:", question);
        const response = await fetch('http://promtiorbot-env.eba-x4hapbrj.us-east-2.elasticbeanstalk.com/ask', {
            method: 'POST',
            headers:{ 'Content-Type': 'application/json',  'Access-Control-Allow-Origin':'*',
                'Access-Control-Allow-Methods':'POST,PATCH,OPTIONS'},
            body: JSON.stringify({ url, pdf_file_path: pdfFilePath, question })
        });

        const data = await response.json();
        setAnswer(data.answer);
    };

    return (
        <div>
            <h1>Ask a Question</h1>
            <form onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    placeholder="Enter URL" 
                    value={url} 
                    onChange={(e) => setUrl(e.target.value)} 
                />
                <input 
                    type="text" 
                    placeholder="Enter PDF file path" 
                    value={pdfFilePath} 
                    onChange={(e) => setPdfFilePath(e.target.value)} 
                />
                <input 
                    type="text" 
                    placeholder="Enter your question" 
                    value={question} 
                    onChange={(e) => setQuestion(e.target.value)} 
                />
                <button type="submit">Submit</button>
            </form>
            {answer && <div><h2>Answer:</h2><p>{answer}</p></div>}
        </div>
    );
};

export default QuestionForm;
