import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from 'hono/jwt'

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
    
        const user = await prisma.user.create({
            data:{
                name : body.name,
                email : body.email,
                password : body.password
            }
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
    
        const user = await prisma.user.findFirst({
            where:{
                email : body.email,
                password : body.password
            }
        })

        if(user!= null){
            const payload = {
                id: user.id
            }
    
            const secret = c.env.JWT_KEY
            const token = await sign(payload, secret)
        
            return c.json({
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