import { Button, Form, Input, } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import { useLogin } from './loginContext';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState } from 'react';

const BASE_URL = import.meta.env.VITE_BASE_URL;
const AUTH_TOKEN = import.meta.env.VITE_AUTH_TOKEN;

let config = {
    headers: {
        Authorization: AUTH_TOKEN,
        Accept: "application/json",
        "Content-Type": "application/json",
    },
};

const LoginPage = ({ }) => {
    const navigate = useNavigate();
    const { username, setUsername, password, setPassword } = useLogin()
    const [error, setError] = useState(false)

    const login = async () => {
        const { data } = await axios.post(`${BASE_URL}login`,
            {
                "usr": username,
                "pwd": password.trim()
            },
            config)
        console.log({ data })
        if (data?.message?.status_code === 200) {
            toast.success("Login successful")
            const jwt_token = data?.message?.token
            localStorage.setItem("token", jwt_token)
            setTimeout(() => {
                navigate("/frontend/calendar");
            }, 2000)
        }
        else if (data?.message?.status_code === 401) {
            setError(true)
        } else {
            toast.error("Something Went Wrong.")
        }
    }

    const onFinish = (values) => {
        login()
        console.log('Received values of form: ', values);
    };

    return (
        <>
            <div
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -60%)',
                    // padding: "2rem",
                    // border: "1px solid #cccccc",
                    // borderRadius: 4
                }}
            >
                <p style={{ marginBottom: '1rem', fontSize: '2rem', fontWeight: 600, }}>Login</p>
                <Form
                    name="normal_login"
                    className="login-form"
                    initialValues={{
                        remember: true,
                    }}
                    onFinish={onFinish}
                >
                    <Form.Item
                        name="username"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your Username!',
                            },
                        ]}
                    >
                        <Input
                            style={{ width: "20rem" }}
                            prefix={<UserOutlined className="site-form-item-icon" />}
                            placeholder="Username"
                            value={username}
                            onChange={(ev) => {
                                setUsername(ev.target.value)
                                setError(false)
                            }}
                        />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[
                            {
                                required: true,
                                message: 'Please input your Password!',
                            },
                        ]}
                    >
                        <Input
                            prefix={<LockOutlined className="site-form-item-icon" />}
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(ev) => {
                                setPassword(ev.target.value)
                                setError(false)
                            }}
                        />
                    </Form.Item>
                    <Form.Item >
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            {/* <Form.Item name="remember" valuePropName="checked" noStyle>
                            <Checkbox>Remember me</Checkbox>
                        </Form.Item> */}

                            <a className="login-form-forgot" href="">
                                Forgot password
                            </a>
                        </div>

                    </Form.Item>
                    {
                        error && <p style={{ textAlign: "center", color: 'red' }}>Invalid Username or Password</p>
                    }
                    <Button style={{ width: '20rem' }} type="primary" htmlType="submit" className="login-form-button">
                        Log in
                    </Button>
                </Form>

            </div>
            <ToastContainer />
        </>
    )
}

export default LoginPage