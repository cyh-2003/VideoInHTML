using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace 贪吃蛇
{
    //游戏主体
    internal class Game
    {
        static public update nowScene;
        public Game()
        {
            nowScene = new Start();

            Console.CursorVisible = false;

            Console.SetWindowSize(100, 30);
            Console.SetBufferSize(100, 30);

            for (int i = 0; i < 80; i++)
            {
                GameDate.walls[i] = new Wall(i, 0);
            }
            for (int i = 0; i < 80; i++)
            {
                GameDate.walls[80 + i] = new Wall(i, 20);
            }
            for (int i = 0; i < 20; i++)
            {
                GameDate.walls[160 + i] = new Wall(0, i);
            }
            for (int i = 0; i < 20; i++)
            {
                GameDate.walls[180 + i] = new Wall(80, i);
            }



        }
            
        
        public void Star()
        {
            //开辟一个线程,执行NewThraed方法
            Thread th = new Thread(NewThraed);
            th.Start();
        }

        public void NewThraed()
        {
            while (true)
            {
                Thread.Sleep(100);
                if (nowScene != null)
                {
                    nowScene.Update();
                }
            }
        }
    }
}
