import React, { useContext, useEffect, useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { Modal } from '../reusables/Modal';
import { Spinner } from '../reusables/Spinner';
import { ModalHeader } from '../reusables/ModalHeader';
import {
  useFeedScroll,
  useSpaceData,
  useSpaceRequests,
  usePushSpaceSocket,
} from '../../../hooks';
import { SpaceBanner } from '../SpaceBanner';

import { ISpacesTheme } from '../theme';
import { ThemeContext } from '../theme/ThemeProvider';

export interface ISpaceInvitesProps {
  children?: React.ReactNode;
}

interface IThemeProps {
  theme?: ISpacesTheme;
}

// temp
let spaceId = '';

export const SpaceInvites: React.FC<ISpaceInvitesProps> = ({
  children,
}: ISpaceInvitesProps) => {
  const theme = useContext(ThemeContext);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const { spaceRequests, setSpaceRequests } = useSpaceData();

  const containerRef = useFeedScroll(spaceRequests.apiData?.length);

  const [playBackUrl, setPlayBackUrl] = useState<string>('');
  const {
    spacesObjectRef,
    spaceObjectData,
    initSpaceObject,
    setSpaceWidgetId,
    isSpeaker,
    isListener,
    account,
    env,
  } = useSpaceData();

  usePushSpaceSocket({ account, env });

  const handleJoinSpace = async (space: any) => {
    await initSpaceObject(space?.spaceId as string);

    if (isSpeaker) {
      // create audio stream
      await spacesObjectRef.current.createAudioStream();
      spaceId = space?.spaceId; // temp
    }
    if (isListener) {
      await spacesObjectRef?.current?.join();
      const playBackUrl = spaceObjectData.spaceDescription;
      setPlayBackUrl(playBackUrl);
      handleCloseModal();
      setSpaceWidgetId(space?.spaceId as string);
      console.log('space joined');
    }
  };

  useEffect(() => {
    if (!spaceObjectData?.connectionData?.local.stream || !isSpeaker) return;
    const joinSpaceAsSpeaker = async () => {
      console.log('joining as a speaker');
      await spacesObjectRef?.current?.join();
      setSpaceWidgetId(spaceId);
      console.log('space joined');
      handleCloseModal();
    };
    joinSpaceAsSpeaker();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spaceObjectData?.connectionData?.local.stream]);

  const handleOpenModal = () => {
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const loadMoreData = () => {
    if (
      loading === false &&
      spaceRequests.currentPage &&
      spaceRequests.lastPage &&
      spaceRequests.currentPage < spaceRequests.lastPage
    ) {
      console.log('Load More Data');
      setSpaceRequests({
        currentPage: spaceRequests.currentPage + 1,
        lastPage: spaceRequests.lastPage + 1,
      });
    }
  };

  const onScrollContainer = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      if (scrollTop + clientHeight >= scrollHeight) {
        loadMoreData();
      }
    }
  };

  const { loading } = useSpaceRequests(account);
  return (
    <ThemeProvider theme={theme}>
      {!children && <Button onClick={handleOpenModal}>Space Invites</Button>}

      {children && <div onClick={handleOpenModal}>{children}</div>}

      {modalOpen && (
        <Modal clickawayClose={handleCloseModal} width="450px">
          <ModalHeader
            heading="Spaces Invites"
            headingBadgeNumber={
              (spaceRequests.apiData?.length as number) > 0
                ? spaceRequests.apiData?.length
                : undefined
            }
            closeCallback={handleCloseModal}
          />
          <ScrollContainer ref={containerRef} onScroll={onScrollContainer}>
            <InviteContainer>
              {spaceRequests.apiData
                ? spaceRequests.apiData.map((space: any) => {
                    return (
                      <SpaceBanner
                        spaceId={space.spaceId}
                        orientation="maximized"
                        isInvite={true}
                        onJoin={() => handleJoinSpace(space)}
                      />
                    );
                  })
                : null}
              {loading ? <Spinner size="40" /> : null}
            </InviteContainer>
          </ScrollContainer>
        </Modal>
      )}
    </ThemeProvider>
  );
};

const Button = styled.button<IThemeProps>`
  padding: 8px 16px;
  background-color: ${(props) => props.theme.btnColorPrimary};
  color: ${(props) => props.theme.textColorPrimary};
  border: none;
  border-radius: 4px;
  cursor: pointer;
`;

const ScrollContainer = styled.div<IThemeProps>`
  max-height: 400px;
  width: inherit;
  margin-top: 24px;
  overflow-y: scroll;

  &::-webkit-scrollbar {
    margin-left: 10px;
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-thumb {
    -webkit-appearance: none;
    width: 4px;
    height: auto;
    background: ${(props) => props.theme.btnColorPrimary};
    border-radius: 99px;
  }
`;

const InviteContainer = styled.div<IThemeProps>`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 0 10px;
`;
