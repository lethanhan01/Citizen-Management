import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>404</h1>
      <h2>Không Tìm Thấy Trang</h2>
      <p>
        Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
      </p>
      <Link to="/">
        <button>Quay về Trang chủ</button>
      </Link>
    </div>
  );
}





