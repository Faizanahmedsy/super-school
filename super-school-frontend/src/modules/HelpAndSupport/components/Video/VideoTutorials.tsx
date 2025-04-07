import * as React from 'react';

import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import YouTubeVideoDialog from './YouTubeVideoDialog';
import UIText from '@/components/global/Text/UIText';

export default function VideoTutorials() {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const data = [
    {
      videoSrc: '/file/tutorial1.mp4',
      thumbnailSrc: '/api/placeholder/640/360',
    },
    {
      videoSrc: '/file/tutorial2.mp4',
      thumbnailSrc: '/api/placeholder/640/360',
    },
    {
      videoSrc: '/file/tutorial3.mp4',
      thumbnailSrc: '/api/placeholder/640/360',
    },
    {
      videoSrc: '/file/tutorial4.mp4',
      thumbnailSrc: '/api/placeholder/640/360',
    },
    {
      videoSrc: '/file/tutorial5.mp4',
      thumbnailSrc: '/api/placeholder/640/360',
    },
    {
      videoSrc: '/file/tutorial6.mp4',
      thumbnailSrc: '/api/placeholder/640/360',
    },
    {
      videoSrc: '/file/tutorial7.mp4',
      thumbnailSrc: '/api/placeholder/640/360',
    },
  ];

  const getStepTitle = (index: number) => {
    switch (index) {
      case 1:
        return (
          <>
            <UIText>School Creation </UIText>
          </>
        );
      case 2:
        return (
          <>
            <UIText>School Setup</UIText>
          </>
        );
      case 3:
        return (
          <>
            <UIText>How to Create Teachers & Learners</UIText>
          </>
        );
      case 4:
        return (
          <>
            <UIText>How to Create Assessment</UIText>
          </>
        );
      case 5:
        return (
          <>
            <UIText>How to Start Digital Marking</UIText>
          </>
        );
      case 6:
        return (
          <>
            <UIText>How to Manual Review complete</UIText>
          </>
        );
      case 7:
        return (
          <>
            <UIText>How to Create Event and Exam Timetable</UIText>
          </>
        );
      default:
        return (
          <>
            <UIText>How to Create lesson plan</UIText>
          </>
        );
    }
  };

  return (
    <>
      <div className="mx-auto max-w-[800px]">
        <div>
          <h2 className="text-2xl font-semibold text-center">{getStepTitle(current)}</h2>
          <p className="text-center text-muted-foreground">
            <UIText>Learn how to use our platform with these video tutorials.</UIText>
          </p>
        </div>
        <Carousel setApi={setApi} className="w-full max-w-[800px]">
          <CarouselContent>
            {data.map((item, index) => (
              <CarouselItem key={index}>
                <Card>
                  <CardContent className="flex aspect-video items-center justify-center p-6">
                    <YouTubeVideoDialog videoSrc={item.videoSrc} thumbnailSrc={item.thumbnailSrc} />
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        <div className="py-2 text-center text-sm text-muted-foreground">
          Slide {current} of {count}
        </div>
      </div>
    </>
  );
}
