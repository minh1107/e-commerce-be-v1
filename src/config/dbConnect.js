const { default: moogoose} = require('mongoose')

const dbConnect =  async() => {
    try {
        const conn = await moogoose.connect(process.env.DATABASE_URL)
        if(conn.connection.readyState === 1) console.log('Database connect successfully')
        else console.log('Database connect fally ')
    } catch (error) {
        console.log('Db connect fail')
        throw new Error(error)
    }
}

module.exports = dbConnect