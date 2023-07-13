import React, { useCallback } from 'react';
import {
  useDispatch,
  useSelector,
} from 'react-redux';
import i18next from 'i18next';

import {
  selectAvailable,
  selectCurrent,
  update,
} from './languageSlice';

function LanguageSelection() {
  const dispatch = useDispatch();
  const current = useSelector(selectCurrent);
  const languages = useSelector(selectAvailable);

  const handleUpdate = useCallback((e) => {
    const language = e.target.value;
    i18next.changeLanguage(language);

    dispatch(update(language));
  }, [dispatch]);

  const languageElements = languages.map((item) => (
    <option
      key={item.value}
      value={item.value}
    >
      {item.label}
    </option>
  ));

  return (
    <div className="dropdown dark">
      <select
        className="dropdown__select"
        defaultValue={current}
        onChange={handleUpdate}
      >
        {languageElements}
      </select>
    </div>
  );
}

export default LanguageSelection;
