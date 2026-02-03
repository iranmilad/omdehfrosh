import React, { useEffect, useState } from 'react';
import * as Babel from '@babel/standalone';
import { useDispatch, useSelector } from 'react-redux';
import { userMessagesGetComponent } from '../../../redux/usermyaccounts/usermyaccounts/usermessagesgetcomponent/userMessagesGetComponentActions';
import { userMessagesModalComponentGet } from '../../../redux/usermyaccounts/usermyaccounts/usermessagesgetcomponent/usermessagesmodalcomponentget/userMessagesModalComponentGetActions';
import { Box, Table, Text } from '@mantine/core';
import DynamicModal from './DynamicModals';
import { setNotificationSeen } from '../../../redux/usermyaccounts/usermyaccounts/notifications/setnotificationseen/setNotificationSeenActions';
import { useQueryClient } from '../../../Libs/reactQuery';

const DynamicTables = () => {
  const [Component, setComponent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalComponent, setModalComponent] = useState(null);
  const [shouldOpenModal, setShouldOpenModal] = useState(false);

  const dispatch = useDispatch();

  const {
    userMessagesComponent,
    loadingUserMessagesComponent,
    errorUserMessagesComponent,
  } = useSelector((state) => state.getUserMessagesComponentByUserId);

  const {
    userMessagesModal,
    loadingUserMessagesModal,
    errorUserMessagesModal,
  } = useSelector((state) => state.getUserMessagesModalComponentDataByUserId);

  // Fetch main dynamic component
  useEffect(() => {
    dispatch(userMessagesGetComponent());
  }, [dispatch]);

  // Compile and safely set the main table component
  useEffect(() => {
    if (userMessagesComponent?.component) {
      try {
        const compiledCode = Babel.transform(userMessagesComponent.component, {
          presets: ['react'],
        }).code;

        const GeneratedComponent = new Function(
          'React',
          'Table',
          'Text',
          'return ' + compiledCode
        )(React, Table, Text);

        if (typeof GeneratedComponent === 'function') {
          setComponent(() => GeneratedComponent);
        } else {
        }
      } catch (err) {
      }
    }
  }, [userMessagesComponent]);

  // Compile modal component only if triggered by user click
  useEffect(() => {
    if (userMessagesModal?.component && shouldOpenModal) {
      try {
        const compiledModalCode = Babel.transform(userMessagesModal.component, {
          presets: ['react'],
        }).code;

        const ModalComp = new Function('React', 'Table', 'Text', 'return ' + compiledModalCode)(React, Table, Text);

        if (typeof ModalComp === 'function') {
          setModalComponent(() => ModalComp);
          setModalVisible(true);
        } else {
        }
      } catch (err) {
      } finally {
        setShouldOpenModal(false); // reset after trying to load
      }
    }
  }, [userMessagesModal, shouldOpenModal]);

  // Called by rows in dynamic component
  const handleRowClick = (tableIndex, rowId) => {
    dispatch(setNotificationSeen({ tableIndex, rowId, isRead: true }));
    queryClient.invalidateQueries({ queryKey: ["notificationNumber"] });
    setShouldOpenModal(true);
    dispatch(userMessagesModalComponentGet({ tableIndex, rowId }));
  };

  if (loadingUserMessagesComponent) return <div>Loading component...</div>;
  if (errorUserMessagesComponent) return <div>Error: {errorUserMessagesComponent}</div>;

  return (
    <>
      <Box style={{ width: '100%' }}>
        {Component ? (
          <Box style={{ width: '100%' }}>
            <Component onRowClick={handleRowClick} />
          </Box>
        ) : (
          <div>No component data received.</div>
        )}
      </Box>

      <DynamicModal onClose={() => setModalVisible(false)} opened={modalVisible}>
        {modalComponent && React.createElement(modalComponent)}
      </DynamicModal>
    </>
  );
};

export default DynamicTables;
