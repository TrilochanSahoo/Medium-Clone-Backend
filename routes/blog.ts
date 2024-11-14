import { Hono } from 'hono'
import { Prisma, PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign, verify } from 'hono/jwt'

const blog = new Hono<{
    // added env variable type for ts
	Bindings: {
		DATABASE_URL: string;
        JWT_KEY : string;
	},
    Variables:{
        userId : string
    }
}>()

blog.use('/*', async(c,next)=>{
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
                    message : "Not authorized, please login"
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

blog.post('/', async(c)=>{
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    try {
        const body = await c.req.json()
    
        const blog = await prisma.post.create({
            data:{
                title : body.title,
                content : body.summary,
                category : body.category,
                readTime : body.readTime,
                tag : body.tag,
                image : body.image,
                published : body.published,
                publishedDate : body.publishedDate,
                authorId : c.get("userId")
            }
        })

        const blog_details = await prisma.post_Details.create({
            data:{
                postUid : blog.id,
                content : body.content,
                reactions : 0
            }
        })
    
        return c.json({
            message: "Blog posted successfully",
            BlogInfo : blog
        })
        
    } catch (error) {
        c.status(411)
        return c.json({
            "message": "Incorrect inputs"
        })
        
    }
})

blog.put('/',async(c)=>{
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    try {
        const body = await c.req.json()
    
        const blog = await prisma.post.update({
            where:{
                id : body.blogId,
                authorId : c.get("userId")
            },
            data : {
                title : body.title,
                content : body.summary,
                published : body.published,
                category : body.category,
                readTime : body.readTime,
                tag : body.tag,
                image : body.image,
                publishedDate : body.publishedDate
            }
        })

        const blog_details = await prisma.post_Details.updateMany({
            where:{
                postUid : body.blogId
            },
            data:{
                content : body.content
            }
        })

        return c.json({
            "message": "Blog updated successfully",
            "BlogInfo" : blog
        })
    
    } catch (error) {
        c.status(411)
        return c.json({
            "message": error
        })
    }
})


// todo = pagination
blog.get('/bulk',async (c)=>{
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    try {
        const blog = await prisma.post.findMany({
            select:{
                id :true, 
                title :true, 
                content :true, 
                publishedDate :true,
                category :true, 
                readTime :true, 
                tag :true, 
                image :true, 
                author: {
                    select : {
                        name : true
                    }
                }
            },
            where : {
                published : true
            }
        })

        return c.json({
            blogInfo : blog
        })
        
    } catch (error) {
        c.status(411)
        return c.json({
            "message": error
        })   
    }
})

blog.get('/:id',async (c)=>{
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    try {
        const blogId = await c.req.param("id")
        const blog = await prisma.post.findFirst({
            select:{
                title: true,
                category : true,
                author : {
                    select : {
                        name: true
                    }
                },
                publishedDate : true,
                readTime : true,
                image : true,
                postDetails : {
                    select : {
                        content : true
                    }
                }
            },
            where:{
                id : blogId,
                authorId : c.get("userId")
            }
        })

        return c.json({
            blogInfo : blog
        })
    } 
    catch (error) {
        c.status(411)
        return c.json({
            "message": error
        })   
    }
})

blog.get('/owned/:published',async (c)=>{
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())

    try {

        const isPublished = await c.req.param("published")

        const blog = await prisma.post.findMany({
            select:{
                id :true, 
                title :true, 
                content :true, 
                publishedDate :true,
                category :true, 
                readTime :true, 
                tag :true, 
                image :true, 
                published : true,
                author: {
                    select : {
                        name : true
                    }
                }
            },
            where : {
                published : (isPublished === "true"),
                authorId : c.get("userId")
            },
            orderBy : {
                publishedDate : 'desc'
            }
        })

        return c.json({
            blogInfo : blog
        })
        
    } catch (error) {
        c.status(411)
        return c.json({
            "message": error
        })   
    }
})

blog.post('/search',async (c)=>{
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate()) 

    try {
        const body = await c.req.json()

        let condition:Prisma.PostWhereInput = {
            AND  : [] as Prisma.PostWhereInput[]
        }

        console.log(1)

        if(body.type==="category"){
            
            (condition.AND as Prisma.PostWhereInput[]).push({ published: true });
            (condition.AND as Prisma.PostWhereInput[]).push({category : body.info});
        }
        else{
            (condition.AND as Prisma.PostWhereInput[]).push({published : true});
            (condition.AND as Prisma.PostWhereInput[]).push({
                    OR: [
                        {title: {contains: body.info, mode: 'insensitive'}},
                        {tag: {contains: body.info, mode: 'insensitive'}}
                    ]
                }
            );
        }
        console.log(condition)
        const blog = await prisma.post.findMany({
            select:{
                id :true, 
                title :true, 
                content :true, 
                publishedDate :true,
                category :true, 
                readTime :true, 
                tag :true, 
                image :true, 
                published : true,
                author: {
                    select : {
                        name : true
                    }
                }
            },
            where : condition,
            orderBy : {
                publishedDate : 'desc'
            }
        })
        return c.json({
            bloginfo : blog
        })
        
    } 
    catch (error) {
        return c.json({
            "message": error
        }) 
    }
})


export default blog

