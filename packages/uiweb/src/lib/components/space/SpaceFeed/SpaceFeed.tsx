import React, { useState } from 'react';
import styled from 'styled-components';

import { SpaceBanner } from '../SpaceBanner';

import { Spinner } from '../reusables/Spinner';

import {
  useSpaceData,
  useFeedScroll,
  useMySpaces,
  usePopularSpaces,
  useSpaceRequests,
} from '../../../hooks';
import { ISpacePaginationData } from '../../../context/spacesContext';

enum OrientationEnums {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
}

enum Tabs {
  ForYou = 'For You',
  Popular = 'Popular',
  Requests = 'Requests',
}

enum FilterEnums {
  All = 'All',
  Live = 'Live',
  Scheduled = 'Scheduled',
}
export interface ISpaceFeedProps {
  account?: any;
  orientation?: 'horizontal' | 'vertical';
  height?: number;
  width?: number;
  sortingOrder?: string[];
  showTabs?: boolean;
  filter?: FilterEnums.All | FilterEnums.Live | FilterEnums.Scheduled;
  showFilter?: boolean;
  onBannerClick?: (arg: string) => void;
}

export const SpaceFeed: React.FC<ISpaceFeedProps> = ({
  account = '0x04bE5701AB5b2f2117332b4748020737B29a2e1D',
  orientation = 'veritcal',
  height,
  width,
  sortingOrder = [Tabs.ForYou, Tabs.Popular, Tabs.Requests],
  showTabs = true,
  filter = FilterEnums.All,
  showFilter = true,
  onBannerClick,
}) => {
  const [tab, setTab] = useState<string>(sortingOrder[0]);
  const [filterTab, setFilterTab] = useState(filter);

  const {
    mySpaces,
    setMySpaces,
    popularSpaces,
    setPopularSpaces,
    spaceRequests,
    setSpaceRequests,
    loading,
  } = useSpaceData();

  const listInnerRef = useFeedScroll(mySpaces.apiData?.length);

  const handleTabChange = (tab: string) => {
    setTab(tab);
  };

  const handleFilterData = (spacesList: any) => {
    if (filterTab === FilterEnums.All) {
      return spacesList;
    } else if (filterTab === FilterEnums.Live) {
      return spacesList.filter(
        (space: any) => space.spaceInformation.status === 'ACTIVE'
      );
    } else if (filterTab === FilterEnums.Scheduled) {
      return spacesList.filter(
        (space: any) => space.spaceInformation.status === 'PENDING'
      );
    } else {
      return spacesList;
    }
  };

  const handleClick = (spaceId: string) => {
    if (onBannerClick) {
      onBannerClick(spaceId || '');
    }
  };

  const incrementSpacePage = async (spaces: ISpacePaginationData) => {
    if (
      loading === false &&
      spaces.currentPage &&
      spaces.lastPage &&
      spaces.currentPage < spaces.lastPage
    ) {
      if (spaces === mySpaces)
        spaces.currentPage &&
          setMySpaces({
            currentPage: spaces.currentPage + 1,
            lastPage: spaces.lastPage + 1,
          });
      if (spaces === popularSpaces)
        spaces.currentPage &&
          setPopularSpaces({
            currentPage: spaces.currentPage + 1,
            lastPage: spaces.lastPage + 1,
          });
      if (spaces === spaceRequests)
        spaces.currentPage &&
          setSpaceRequests({
            currentPage: spaces.currentPage + 1,
            lastPage: spaces.lastPage + 1,
          });
    } else {
      return;
    }
  };

  const loadMoreData = async () => {
    if (tab === Tabs.ForYou) {
      incrementSpacePage(mySpaces);
    }
    if (tab === Tabs.Popular) {
      incrementSpacePage(popularSpaces);
    }
    if (tab === Tabs.Requests) {
      incrementSpacePage(spaceRequests);
    }
  };

  const onScroll = () => {
    if (listInnerRef.current) {
      const { scrollTop } = listInnerRef.current;
      const { offsetHeight } = listInnerRef.current;
      const { scrollHeight } = listInnerRef.current;

      if (scrollTop + offsetHeight + 1 >= scrollHeight) {
        loadMoreData();
      }
    }
  };

  //API calls
  useMySpaces(account);
  usePopularSpaces();
  useSpaceRequests(account);

  console.log('requests', spaceRequests);

  return (
    <div>
      {orientation === OrientationEnums.Horizontal ? (
        <Spaces orientation={orientation}>
          {orientation === OrientationEnums.Horizontal
            ? mySpaces &&
              mySpaces.apiData?.map((space: any, index: any) => {
                return (
                  <SpaceBanner
                    spaceId={space.spaceId}
                    orientation="pill"
                    onBannerClick={handleClick}
                  />
                );
              })
            : mySpaces &&
              mySpaces.apiData?.map((space: any, index: any) => {
                return (
                  <SpaceBanner
                    spaceId={space?.spaceId}
                    orientation="maximized"
                    onBannerClick={handleClick}
                  />
                );
              })}
        </Spaces>
      ) : (
        <>
          <Navigation showTabs={showTabs} width={width}>
            <NavButtonWrapper>
              {sortingOrder.map((tabName: string) => {
                return (
                  <NavButton
                    active={tab === tabName}
                    onClick={() => handleTabChange(tabName)}
                  >
                    {tabName}
                  </NavButton>
                );
              })}
            </NavButtonWrapper>
          </Navigation>
          <Filter showFilter={showFilter}>
            <FilterButton
              active={filterTab === FilterEnums.All}
              onClick={() => setFilterTab(FilterEnums.All)}
            >
              All
            </FilterButton>
            <FilterButton
              active={filterTab === FilterEnums.Live}
              onClick={() => setFilterTab(FilterEnums.Live)}
            >
              Live
            </FilterButton>
            <FilterButton
              active={filterTab === FilterEnums.Scheduled}
              onClick={() => setFilterTab(FilterEnums.Scheduled)}
            >
              Scheduled
            </FilterButton>
          </Filter>
          <ScrollContainer
            width={width}
            height={height}
            ref={listInnerRef}
            onScroll={onScroll}
          >
            <Container>
              {tab === Tabs.ForYou ? (
                <Spaces orientation={orientation}>
                  {mySpaces &&
                    handleFilterData(mySpaces.apiData).map(
                      (space: { spaceId: string }, index: any) => {
                        return (
                          <SpaceBanner
                            spaceId={space.spaceId}
                            orientation="maximized"
                            onBannerClick={handleClick}
                          />
                        );
                      }
                    )}
                </Spaces>
              ) : tab === Tabs.Popular ? (
                <PopularSpaces>
                  <Text>Popular Spaces</Text>
                  {popularSpaces &&
                    handleFilterData(popularSpaces.apiData).map(
                      (space: { spaceId: string }, index: any) => {
                        return (
                          <SpaceBanner
                            spaceId={space.spaceId}
                            orientation="maximized"
                            onBannerClick={handleClick}
                          />
                        );
                      }
                    )}
                </PopularSpaces>
              ) : (
                <Spaces orientation={orientation}>
                  {spaceRequests &&
                    handleFilterData(spaceRequests.apiData).map(
                      (space: { spaceId: string }, index: any) => {
                        return (
                          <SpaceBanner
                            spaceId={space.spaceId}
                            orientation="maximized"
                            onBannerClick={handleClick}
                          />
                        );
                      }
                    )}
                </Spaces>
              )}
              {loading && <Spinner size="40" />}
            </Container>
          </ScrollContainer>
        </>
      )}
    </div>
  );
};

//Styling
const ScrollContainer = styled.div<{ height?: number; width?: number }>`
  width: ${(props) => (props.width ? `${props.width}px` : 'inherit')};
  height: ${(props) => (props.height ? `${props.height}px` : 'auto')};
  overflow-y: auto;
}`;
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #ffffff;
  border: 1px solid #dcdcdf;
  border-radius: 12px;
  padding: 24px 32px;
}`;

const Navigation = styled.div<{
  showTabs?: boolean;
  width?: number;
}>`
  display: ${(props) => (props.showTabs ? 'flex' : 'none')};
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: ${(props) => (props.width ? `${props.width}px` : 'inherit')};
  border-bottom: 1px solid #DCDCDF;
}`;

const NavButtonWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}`;

const NavButton = styled.button<{ active?: boolean }>`
  padding: 10px 30px;
  font-weight: 450;
  font-size: 14px;
  border: none;
  border-bottom: ${(props) => (props.active ? '2px solid #8B5CF6' : 'none')};
  background: none;
  color : ${(props) => (props.active ? '#000000' : '#71717A')};

  &:hover {
    cursor: pointer;
  }
}`;

const Spaces = styled.div<{ orientation?: string }>`
  display: flex;
  flex-direction: ${(props) =>
    props.orientation === 'horizontal' ? 'row' : 'column'};
  justify-content: flex-start;
  align-items: center;
  background: #ffffff;
  width: ${(props) =>
    props.orientation === 'horizontal' ? 'inherit' : '100%'};
  height: auto;
  gap: 16px;
}`;

const PopularSpaces = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  width: 100%;  
  height: auto;
  gap: 16px;
}`;

const Text = styled.div`
  width: 100%;
  text-align: left;
  font-family: 'Strawford';
  font-weight: 450;
  font-size: 18px;
}`;

const Filter = styled.div<{ showFilter?: boolean }>`
  display: ${(props) => (props.showFilter ? 'flex' : 'none')};
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  background: #ffffff;
  width: 100%;
  margin: 22px 0;
}`;

const FilterButton = styled.button<{ active: boolean }>`
  display: inline-flex;
  height: 30px;
  padding: 0px 16px;
  justify-content: center;
  align-items: center;
  border-radius: 99px;
  border: 1px solid #C4B5FD;
  background: ${(props) => (props.active ? '#8B5CF6' : '#EDE9FE')};
  color: ${(props) => (!props.active ? '#8B5CF6' : '#FFF')};
  margin-right: 8px;
  font-size: 14px;

  &:hover {
    cursor: pointer;
  }
}`;
