import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign, decode } from 'hono/jwt'

const auth = new Hono<{
    Bindings: {
        DATABASE_URL:string,
        JWT_KEY : string;
    }
}>()

auth.post('/signup', async(c)=>{
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    try{
        const body = await c.req.json()
        let userdata
        console.log(await decode(body.credential))

        if(!body.externalLogin){
            userdata = {
                name : body.name,
                email : body.email,
                password : body.password
            }
        }
        else{
            const oauth_cred = await decode(body.credential)
            console.log(oauth_cred.payload)
            userdata = {
                name : oauth_cred.payload.name as string,
                email : oauth_cred.payload.email as string,
                externalLogin : body.externalLogin,
                externalId : body.externalId
            }
        }
        
        const user = await prisma.user.create({
            data : userdata
        })
        const payload = {
            id: user.id
        }
        const secret = c.env.JWT_KEY
        const token = await sign(payload, secret)
    
        return c.json({
            message: "User created successfully",
            auth : token
        })
    
    }
    catch (error) {
        c.status(411)
        return c.json({
            "message": "Email already taken / Incorrect inputs"
        })
        
    }
})


auth.post('/signin', async (c) => {

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    try {
        const body = await c.req.json()

        let userdata

        if(!body.externalLogin){
            userdata = {
                email : body.email,
                password : body.password
            }
        }
        else{
            userdata = {
                email : body.email,
                externalLogin : body.externalLogin,
                // externalId : body.externalId
            }
        }

        const user = await prisma.user.findFirst({
            where:userdata
        })

        if(user!= null){
            const payload = {
                id: user.id
            }
    
            const secret = c.env.JWT_KEY
            const token = await sign(payload, secret)
        
            return c.json({
                message: "User logged in successfully",
                auth : token
            })
        } 
        else{
            c.status(411)
            return c.json({
                message: "Error while logging in"
            })
        }
    
    } catch (error) {
        c.status(411)
        return c.json({
            "message": "Incorrect Input."
        })
    }
})

export default auth