import { Hono } from 'hono'
import user from '../routes/user'
import blog from '../routes/blog'
import auth from '../routes/auth'


const app = new Hono()

app.route('/api/v1/auth',auth)
app.route('/api/v1/user',user)
app.route('/api/v1/blog',blog)


export default app
