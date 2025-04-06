import AppPageMeta from '@/app/components/AppPageMeta';
import AppsContainer from '@/app/components/AppsContainer';
import { TextBox } from '@/components/custom/cards/TextBox';
import PageTitle from '@/components/global/PageTitle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Book, Newspaper, TvMinimalPlay } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function IndividualFeedback() {
  const navigate = useNavigate();
  return (
    <div>
      <AppPageMeta title="Individual Feedback" />
      <PageTitle>Feedback</PageTitle>
      <AppsContainer title={''} fullView={true} type="bottom">
        <Card className="bg-gray-100 border border-gray-500 rounded-lg mb-5">
          <CardHeader>
            <CardTitle>Feedback</CardTitle>
            <CardDescription>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
              dolore magna aliqua.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>1. Lorem ipsum dolor sit amet</p>
            <p>2. Lorem ipsum dolor sit amet</p>
            <p>3. Lorem ipsum dolor sit amet</p>
          </CardContent>
        </Card>
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="bg-teal-100 border border-teal-500 rounded-lg">
            <CardHeader>
              <CardTitle>Strength</CardTitle>
              <CardDescription>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua.
              </CardDescription>
              <CardContent className="p-0">
                <TextBox className="bg-teal-200" btn={false}>
                  1. Lorem ipsum dolor sit amet
                </TextBox>
                <TextBox className="bg-teal-200" btn={false}>
                  2. Lorem ipsum dolor sit amet
                </TextBox>
                <TextBox className="bg-teal-200" btn={false}>
                  3. Lorem ipsum dolor sit amet
                </TextBox>
              </CardContent>
            </CardHeader>
          </Card>
          <Card className="bg-rose-100 border border-rose-500 rounded-lg">
            <CardHeader>
              <CardTitle>Weakness</CardTitle>
              <CardDescription>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua.
              </CardDescription>
              <CardContent className="p-0">
                <TextBox
                  className="bg-rose-200"
                  btn={
                    <Button variant={'outline'} size={'sm'} onClick={() => navigate('/quiz/individual')}>
                      Take Quiz
                    </Button>
                  }
                >
                  1. Lorem ipsum dolor sit amet
                </TextBox>
                <TextBox
                  className="bg-rose-200"
                  btn={
                    <Button variant={'outline'} size={'sm'} onClick={() => navigate('/quiz/individual')}>
                      Take Quiz
                    </Button>
                  }
                >
                  2. Lorem ipsum dolor sit amet
                </TextBox>
                <TextBox
                  className="bg-rose-200"
                  btn={
                    <Button variant={'outline'} size={'sm'} onClick={() => navigate('/quiz/individual')}>
                      Take Quiz
                    </Button>
                  }
                >
                  3. Lorem ipsum dolor sit amet
                </TextBox>
              </CardContent>
            </CardHeader>
          </Card>
          <Card className="bg-blue-100 border border-blue-500 rounded-lg col-span-2">
            <CardHeader>
              <CardTitle>Suggested Materials</CardTitle>
              <CardDescription>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua.
              </CardDescription>
              <CardContent className="p-0 ">
                <div className="grid md:grid-cols-6 gap-2">
                  <div className="w-fit p-4 bg-blue-200 rounded-2xl flex justify-center items-start flex-col">
                    <Book />
                    <h6>R D Sharma</h6>
                  </div>
                  <div className="w-fit p-4 bg-blue-200 rounded-2xl flex justify-center items-start flex-col">
                    <TvMinimalPlay />
                    <h6>R D Sharma</h6>
                  </div>
                  <div className="w-fit p-4 bg-blue-200 rounded-2xl flex justify-center items-start flex-col">
                    <Newspaper />
                    <h6>R D Sharma</h6>
                  </div>
                  <div className="w-fit p-4 bg-blue-200 rounded-2xl flex justify-center items-start flex-col">
                    <TvMinimalPlay />

                    <h6>R D Sharma</h6>
                  </div>
                  <div className="w-fit p-4 bg-blue-200 rounded-2xl flex justify-center items-start flex-col">
                    <TvMinimalPlay />

                    <h6>R D Sharma</h6>
                  </div>
                  <div className="w-fit p-4 bg-blue-200 rounded-2xl flex justify-center items-start flex-col">
                    <Book />
                    <h6>R D Sharma</h6>
                  </div>
                </div>
              </CardContent>
            </CardHeader>
          </Card>
        </div>
      </AppsContainer>
    </div>
  );
}
