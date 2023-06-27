import React from 'react';
import PropTypes from 'prop-types';

function Content({ entries }) {
  const entryElements = entries.map((entry) => {
    const listItems = entry.items.map((item) => (
      <li key={item}>
        {item}
      </li>
    ));

    return (
      <div key={entry.title}>
        <span>
          {entry.title}
        </span>

        <ul>
          {listItems}
        </ul>
      </div>
    );
  });

  return(entryElements);
}

Content.propTypes = {
  entries: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(PropTypes.string).isRequired,
  })).isRequired,
};

export default Content;
