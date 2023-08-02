const fileSysytem = require('fs')
require('colors')
const dotenv = require('dotenv')
const prodectModel = require('../../model/productModel')
const dbConnnection = require('../../config/db')

dotenv.config({ path: '../../config.env' })


dbConnnection();

const prodect = JSON.parse(fileSysytem.readFileSync('./products.json'));


const insertData = async () => {
    try {
        await prodectModel.create(prodect);
        console.log('Data Inserted'.green.inverse);
        process.exit();
    } catch (e) {
        console.log(e)
    }
}



const destroyData = async () => {
    try {
        await prodectModel.deleteMany();
        console.log('Data Destroyed'.red.inverse);
        process.exit();
    } catch (e) {
        console.log(e)
    }
}

if (process.argv[2] === '-i') {
    insertData()
} else if (process.argv[2] === '-d') {
    destroyData()
}
