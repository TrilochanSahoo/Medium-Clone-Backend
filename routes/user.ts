import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign, verify } from 'hono/jwt'

const user = new Hono<{
    // added env variable type for ts
	Bindings: {
		DATABASE_URL: string;
        JWT_KEY : string;
	},
    Variables:{
        userId : string
    }
}>()


user.use('/*', async(c,next)=>{
    const authheader = c.req.header("authorization") || ""
    const authtoken = authheader.split(" ")[1]

    try {
        const userPayload = await verify(authtoken, c.env.JWT_KEY)
    
        if(userPayload){
            const prisma = new PrismaClient({
                datasourceUrl: c.env.DATABASE_URL,
            }).$extends(withAccelerate())
    
            const user = await prisma.user.findFirst({
                where:{
                    id : String(userPayload.id)
                }
            })
    
            if(!user){
                c.status(401)
                return c.json({
                    message : "User was not found"
                })
            }else{
                c.set("userId",user.id)
                await next()
            }
    
        }
        else{
            c.status(401)
            return c.json({
                message : "Not authorized, please login"
            })
        }
    } catch (error) {
        c.status(403)
        return c.json({
            "message": "Server Error"
        })
    }
})

user.post('/signup', async (c) => {

    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    try {
        const body = await c.req.json()
    
        const user = await prisma.user.create({
            data:{
                email : body.email,
                name : body.name,
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
        
    } catch (error) {
        c.status(411)
        return c.json({
            "message": "Email already taken / Incorrect inputs"
        })
        
    }
})



user.post('/signin', async (c) => {

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

user.put('/', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    try {
        const body = await c.req.json()
    
        const user = await prisma.user.update({
            where:{
               id : c.get("userId")
            },
            data : {
                email : body.email,
                name : body.name,
                password : body.password
            }
        })

        return c.json({
            "message": "User updated successfully"
        })
    
    } catch (error) {
        c.status(411)
        return c.json({
            "message": error
        })
    }
})

user.get('/', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    try {
    
        const user = await prisma.user.findFirst({
            where:{
               id : c.get("userId")
            }
        })

        return c.json({
            userInfo : user
        })
    
    } catch (error) {
        c.status(411)
        return c.json({
            "message": error
        })
    }
})



export default user