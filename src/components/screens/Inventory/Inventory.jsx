export default function Inventory({ onClose }) {
  return (
    <div style={{ background: 'rgba(0,0,0,0.8)', padding: '50px', color: 'white' }}>
      <h1>INVENTORY</h1>
      <button onClick={onClose}>Close (E)</button>
    </div>
  );
}