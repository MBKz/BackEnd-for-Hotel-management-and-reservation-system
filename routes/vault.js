const express = require("express");
const router = express.Router();
const dump = require('mysqldump');
const config = require('config');
const Importer = require('mysql-import');
const { readdir,readFile } = require("fs/promises");
const db = require('../setup/db');

// Back Up
router.post('/backup', async(req,res)=>{

    if(!req.body.filename) return res.status(400).send({message: 'Filename is required'})
    let d = new Date();
    d = `${d.getFullYear() }-${d.getMonth()}-${d.getDate()}`
    await dump({
       connection: {
           host: config.get("db.host"),
           user:config.get("db.username"),
           password: config.get("db.password"),
           database: config.get("db.database"),
       },
       dumpToFile:`./vault/${d} ${ req.body.filename}.sql`
   });
   res.status(200).send({message:'Your Data Has Been Backed Up .'});
});

// SHow back up file names
router.get('/backup/filenames',async(req,res)=>{
    
    var dir = await readdir('./vault');
    var filenames = []
    dir.forEach((e)=>{
        filenames.push(e.split('.').slice(0, -1).join('.'));
    })
    res.status(200).send({message:'okay',files:filenames});
});

// Restore
router.post('/restore',async(req,res)=>{

    if(!req.body.filename) return res.status(400).send({message: 'Filename is required'})
    var file = await readFile(`./vault/${req.body.filename}.sql`)
    if(!file)return res.status(400).send({message: 'file is not found'});

    const host = config.get("db.host");
    const user = config.get("db.username");
    const password = config.get("db.password");
    const database = config.get("db.database");

    await db.sync({ force: true });
    
    const importer = new Importer({host, user, password, database});
    importer.import(`./vault/${req.body.filename}.sql`)

    res.status(200).send({message:'Your Data Has Been Restored .'});
});

module.exports = router;