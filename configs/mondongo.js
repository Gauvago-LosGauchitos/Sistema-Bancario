'use strict'

import mongoose from "mongoose"

export const connect = async ()=>{
    try{
        mongoose.connection.on('error', ()=>{
            console.log('MongoDB | could not be connect to mongodb')
            mongoose.disconnect()
        })
        mongoose.connection.on('connecting', ()=>{
            console.log('MongoDB | try connecting')
        })
        mongoose.connection.on('connected', ()=>{
            console.log('MongoDB | connected to mongodb')
        })
        mongoose.connection.once('open', async ()=>{
            console.log('MongoDB | connected to database || Welcome to Bank System');
        })
        mongoose.connection.on('reconnected', ()=>{
            console.log('MongoDB | reconected to mongodb')
        })
        mongoose.connection.on('disconnected', ()=>{
            console.log('MongoDB | disconnected')
        })
        
        await mongoose.connect(process.env.URI_MONGO, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 50
        })

    }catch(err){
        console.error('Database connection failed',err)
    }
}