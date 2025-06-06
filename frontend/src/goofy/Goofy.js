// src/Goofy.js
import React from 'react';
import './Goofy.css';

export default function Goofy() {
  return (
    <section className="goofy-placeholder">
      <h2 className="goofy-heading">
        Moop Bloop<br />
        beep boop<br />
        Goofball3000 is being built<br />
        leep loop
      </h2>
      <div className="goofy-image-row">
        <img src="/phineas.jpg" alt="Phineas" className="goofy-static-img" />
        <img src="/perry.jpg" alt="Perry" className="goofy-static-img" />
      </div>
    </section>
  );
}




// // src/Goofy.js
// import React, { useMemo } from 'react';
// import PropTypes from 'prop-types';
// import './Goofy.css';

// // Hard-coded map of names → public avatars
// const AVATARS = {
//   Jiamin:     '/Jiamin.png',
//   Isabel:     '/Isabel.png',
//   Caleb:      '/Caleb.png',
//   Elliot:     '/Elliot.png',
//   Brittany:   '/Brittney.png',     // adjust filename if you rename the file
//   Kareem:     '/Kareem.png',
//   'John Eric':'/John_Eric.png',
//   Talie:      '/Talie.png',
//   Carlos:     '/Carlos.png',
// };

// // List of team members
// const teamMembers = [
//   'Jiamin',
//   'Isabel',
//   'Caleb',
//   'Elliot',
//   'Brittany',
//   'Kareem',
//   'John Eric',
//   'Talie',
//   'Carlos',
// ];

// // Simple Fisher–Yates shuffle
// function shuffleArray(array) {
//   for (let i = array.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [array[i], array[j]] = [array[j], array[i]];
//   }
//   return array;
// }

// export default function Goofy({ onSelectProfile }) {
//   // Shuffle once on mount
//   const shuffledMembers = useMemo(() => shuffleArray([...teamMembers]), []);

//   return (
//     <section className="goofy-list">
//       <h2>Select a Teammate</h2>
//       <div className="goofy-grid">
//         {shuffledMembers.map(name => (
//           <button
//             key={name}
//             className="goofy-card"
//             onClick={() => onSelectProfile(name)}
//             aria-label={`View profile for ${name}`}
//           >
//             <img
//               src={AVATARS[name] || '/ferv.png'}  // fallback to default
//               alt={name}
//               className="goofy-avatar"
//             />
//             <span className="goofy-name">{name}</span>
//           </button>
//         ))}
//       </div>
//     </section>
//   );
// }

// Goofy.propTypes = {
//   onSelectProfile: PropTypes.func.isRequired,
// };
