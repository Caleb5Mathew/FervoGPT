// // src/HistoryList.js
// import React from 'react';
// import "./HistoryList.css";

// // Mock history data (replace with real data-fetch logic as needed)
// const mockHistory = [
//   { id: '1', title: 'Initial Drilling Chat', timestamp: '2025-05-20 10:15' },
//   { id: '2', title: 'Budget & Forecast Discussion', timestamp: '2025-05-19 14:30' },
//   { id: '3', title: 'Geology Report Q&A', timestamp: '2025-05-18 09:45' },
// ];

// export default function HistoryList({ history = mockHistory, onSelect }) {
//   return (
//     <section className="history-list">
//       <h2>History</h2>
//       <ul>
//         {history.map(item => (
//           <li
//             key={item.id}
//             className="history-item"
//             onClick={() => onSelect && onSelect(item.id)}
//           >
//             <div className="history-title">{item.title}</div>
//             <div className="history-timestamp">{item.timestamp}</div>
//           </li>
//         ))}
//       </ul>
//     </section>
//   );
// }


// src/HistoryList.js
import React from 'react';
import "./HistoryList.css";

export default function HistoryList() {
  return (
    <section className="history-placeholder">
      <h2 className="history-heading">
        drill history is coming soon<br />
        stay tuned<br />
        sand dunes
      </h2>
      <img
        src="/kenye.gif"
        alt="Loading"
        className="history-gif"
      />
    </section>
  );
}
