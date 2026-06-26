import React,{useState} from 'react'
import { useNavigate, Link } from 'react-router'
import "../auth.form.scss"
import { useAuth } from '../hooks/useAuth'

const Login = () => {

    const { loading, handleLogin } = useAuth()
    const navigate = useNavigate()

    const [ email, setEmail ] = useState("")
    const [ password, setPassword ] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()
        await handleLogin({email,password})
        navigate('/')
    }

    if(loading){
        return (<main><h1>Loading.......</h1></main>)
    }


    return (
        <div className="auth-page-wrapper">
            <div className="auth-container">
                <div className="auth-left">
                    <div className="brand">
                        <div className="logo-icon">I</div>
                        <span className="brand-name">InterviewSage</span>
                    </div>

                    <div className="promo-content">
                        <h1>Expert Job Prep Simplified.</h1>
                        <p>The next generation of career growth is here. Master your interviews with our AI-powered workspace.</p>
                    </div>

                    <div className="trusted-section">
                        <div className="avatars">
                            <div className="avatar"><img src="/avatars/avatar1.png" alt="User 1" /></div>
                            <div className="avatar"><img src="/avatars/avatar2.png" alt="User 2" /></div>
                            <div className="avatar"><img src="/avatars/avatar3.png" alt="User 3" /></div>
                            <div className="avatar"><img src="/avatars/avatar4.png" alt="User 4" /></div>
                        </div>
                        <span>Trusted by 100+ professionals</span>
                    </div>
                </div>

                <div className="auth-right">
                    <div className="auth-card">
                        <h2>Welcome Back</h2>
                        <p className="subtitle">Please enter your details to continue</p>

                        <div className="auth-tabs">
                            <Link to="/login" className="tab active">Login</Link>
                            <Link to="/register" className="tab">Register</Link>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="input-group">
                                <label htmlFor="email">Email Address</label>
                                <input
                                    className="auth-input"
                                    onChange={(e) => { setEmail(e.target.value) }}
                                    type="email" id="email" name='email' placeholder='john@example.com' />
                            </div>
                            <div className="input-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    className="auth-input"
                                    onChange={(e) => { setPassword(e.target.value) }}
                                    type="password" id="password" name='password' placeholder='••••••••' />
                            </div>
                            <button className='auth-btn' >Sign In</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login