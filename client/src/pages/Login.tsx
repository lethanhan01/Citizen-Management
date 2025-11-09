export default function Login() {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // process form login in here

        console.log('Sent form login');
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto' }}>
            <h2>Login</h2>
            <p>
                Trang này nằm trong <code>PublicLayout</code>.
            </p>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1rem'}}>
                    <label htmlFor="username">Tên đăng nhập:</label>
                    <input 
                        type="text"
                        id="username"
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="password">Mật khẩu:</label>
                    <input 
                        type="password"
                        id="password"
                        style={{ width: '100%', padding: '8px'}}
                    />
                </div>
                <button
                    type="submit"
                    style={{ padding: '10px 15px' }}
                >
                    Đăng nhập
                </button>
            </form>
        </div>
    );
}