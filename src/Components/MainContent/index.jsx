
import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import PropTypes from 'prop-types';

import Home from '../Home';
import Flash from '../Flash';
import Buttonbar from '../Buttonbar';
import FirmwareSelector from '../FirmwareSelector';
import Changelog from '../../Components/Changelog';
import MotorControl from '../../Components/MotorControl';

import { selectSupported } from '../MelodyEditor/melodiesSlice';
import {
  selectIsReading,
  selectIsSelecting,
  selectIsSupported,
} from '../../Containers/App/stateSlice';
import {
  selectFourWay,
  selectOpen,
} from '../../Containers/App/serialSlice';
import {
  selectIndividual,
  selectTargets,
} from '../../Containers/App/escsSlice';
import { selectFeatures } from '../../Containers/App/mspSlice';

import './style.scss';

function WarningWrapper() {
  const { t } = useTranslation('common');

  return (
    <>
      <div className="note warning">
        <span>
          <strong sx={{ color: "red" }}>
            {t('warning')}
          </strong>

          {t('warningRadio')}
        </span>
      </div>

      <div className="note">
        <p>
          <span>
            <strong>
              {t('note')}
            </strong>
          </span>

          <ReactMarkdown components={{ p: 'span' }}>
            {t('notePropsOff')}
          </ReactMarkdown>

          <br />

          <span>
            <strong>
              {t('note')}
            </strong>

            {t('noteConnectPower')}
          </span>
        </p>
      </div>
    </>
  );
}

function MainContent({
  progress,
  onReadEscs,
  onResetDefaultls,
  onWriteSetup,
  onFirmwareDump,
  onFlashUrl,
  onLocalSubmit,
  onAllMotorSpeed,
  onSingleMotorSpeed,
  port,
  progressReferences,
}) {
  const { t } = useTranslation('common');
  const showMelodyEditor = useSelector(selectSupported);

  const isSelecting = useSelector(selectIsSelecting);
  const isReading = useSelector(selectIsReading);

  const fourWay = useSelector(selectFourWay);
  const open = useSelector(selectOpen);

  const flashTargets = useSelector(selectTargets);
  const escs = useSelector(selectIndividual);

  const unsupported = !useSelector(selectIsSupported);

  const mspFeatures = useSelector(selectFeatures);

  const FlashWrapper = useCallback(() => {
    if(fourWay) {

      return (
        <Flash
          flashProgress={progress}
          onFirmwareDump={onFirmwareDump}
          progressReferences={progressReferences}
          unsupported={unsupported}
        />
      );
    }

    return null;
  }, [
    fourWay,
    progress,
    onFirmwareDump,
    progressReferences,
    unsupported,
  ]);

  const MotorControlWrapper = useCallback(() => {
    if(!fourWay && !isReading) {
      return (
        <MotorControl
          getBatteryState={port.getBatteryState}
          onAllUpdate={onAllMotorSpeed}
          onSingleUpdate={onSingleMotorSpeed}
          startValue={mspFeatures['3D'] ? 1500 : 1000}
        />
      );
    }

    return null;
  }, [
    fourWay,
    isReading,
    mspFeatures,
    port.getBatteryState,
    onAllMotorSpeed,
    onSingleMotorSpeed,
  ]);

  if (!open) {
    return (
      <>
        <Home />

        <Changelog />
      </>
    );
  }

  if (isSelecting) {
    const targetIndex = flashTargets[0];
    const esc = escs.find((esc) => esc.index === targetIndex);
    let warning = null;
    if(esc && esc.actualMake) {
      warning = (
        <>
          <ReactMarkdown>
            {t('mistaggedLine1')}
          </ReactMarkdown>

          <ReactMarkdown>
            {t('mistaggedLine2')}
          </ReactMarkdown>

          <table>
            <tbody>
              <tr>
                <td>
                  {t('mistaggedTagged')}
                </td>

                <td>
                  {esc.make}
                </td>
              </tr>

              <tr>
                <td>
                  {t('mistaggedDetected')}
                </td>

                <td>
                  {esc.actualMake}
                </td>
              </tr>
            </tbody>
          </table>

          <ReactMarkdown>
            {t('mistaggedLine3')}
          </ReactMarkdown>

          <ReactMarkdown>
            {t('mistaggedLine4')}
          </ReactMarkdown>
        </>
      );
    }

    return (
      <div id="content">
        <div className="tab toolbar_fixed_bottom">
          <div className="content_wrapper">
            <FirmwareSelector
              esc={esc}
              onLocalSubmit={onLocalSubmit}
              onSubmit={onFlashUrl}
              warning={warning}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div id="content">
        <div className="tab toolbar_fixed_bottom">
          <div className="content_wrapper">
            <WarningWrapper />

            <FlashWrapper />

            <MotorControlWrapper />
          </div>
        </div>
      </div>

      <Buttonbar
        onReadSetup={onReadEscs}
        onResetDefaults={onResetDefaultls}
        onWriteSetup={onWriteSetup}
        showMelodyEditor={showMelodyEditor}
      />
    </>
  );
}

MainContent.defaultProps = {
  port: { getBatteryState: null },
  progress: [],
};
MainContent.propTypes = {
  onAllMotorSpeed: PropTypes.func.isRequired,
  onFirmwareDump: PropTypes.func.isRequired,
  onFlashUrl: PropTypes.func.isRequired,
  onLocalSubmit: PropTypes.func.isRequired,
  onReadEscs: PropTypes.func.isRequired,
  onResetDefaultls: PropTypes.func.isRequired,
  onSingleMotorSpeed: PropTypes.func.isRequired,
  onWriteSetup: PropTypes.func.isRequired,
  port: PropTypes.shape({ getBatteryState:PropTypes.func }),
  progress: PropTypes.arrayOf(PropTypes.number),
  progressReferences: PropTypes.arrayOf(PropTypes.shape()).isRequired,
};

export default MainContent;
