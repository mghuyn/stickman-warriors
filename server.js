const express = require("express");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

const filePath = path.join(__dirname,"data","accounts.txt");

// nếu chưa có file thì tạo
if(!fs.existsSync(filePath)){
    fs.writeFileSync(filePath,"=== STICKMAN ACCOUNTS ===\n\n");
}

// ================= REGISTER =================
app.post("/register", async (req,res)=>{

    const {username,password} = req.body;

    if(!username || !password){
        return res.send("missing");
    }

    const data = fs.readFileSync(filePath,"utf8");

    // kiểm tra trùng username
    if(data.includes("USER : " + username)){
        return res.send("exist");
    }

    const hash = await bcrypt.hash(password,10);

    const line =
`--------------------------------
USER : ${username}
PASS : ${hash}
CREATED : ${new Date().toLocaleString()}
--------------------------------
`;

    fs.appendFileSync(filePath,line);

    res.send("ok");

});


// ================= LOGIN =================
app.post("/login", async (req,res)=>{

    const {username,password} = req.body;

    const data = fs.readFileSync(filePath,"utf8");

    const blocks = data.split("--------------------------------");

    for(let block of blocks){

        if(block.includes("USER : " + username)){

            const lines = block.split("\n");

            let hash = "";

            for(let line of lines){

                if(line.includes("PASS :")){
                    hash = line.replace("PASS :","").trim();
                }

            }

            if(hash){

                const match = await bcrypt.compare(password,hash);

                if(match){
                    return res.send("ok");
                }

            }

        }

    }

    res.send("fail");

});


app.listen(3000,()=>{
    console.log("Server running http://localhost:3000");
});