using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace 贪吃蛇
{
    abstract internal class StartOrEndScenceBasic:update
    {
        protected string title;
        protected string select;

        int index = 0;

        public void Update()
        {
            //标题
            Console.SetCursorPosition(Console.WindowWidth/2-title.Length,5);
            Console.ForegroundColor = ConsoleColor.White;
            Console.Write(title);

            //选项一
            Console.SetCursorPosition(Console.WindowWidth / 2 - title.Length, 8);
            Console.ForegroundColor = index == 0 ? ConsoleColor.Red : ConsoleColor.White;
            Console.Write(select);

            //退出游戏
            Console.SetCursorPosition(Console.WindowWidth / 2 - title.Length, 11);
            Console.ForegroundColor = index == 1 ? ConsoleColor.Red : ConsoleColor.White;
            Console.Write("退出游戏");

            //接受用户输入
            GetKey(Console.ReadKey(true).Key);
              
        }
        public void GetKey(ConsoleKey k)
        {
            switch (k)
            {
                case ConsoleKey.W:
                    index = index == 0 ? index : 0;
                    break;
                case ConsoleKey.S:
                    index = index == 1 ? index : 1;
                    break;
                case ConsoleKey.J:
                    if (index == 0)
                    {
                        ChangeScene();
                    }
                    else
                    {
                        Environment.Exit(0);
                    }
                    break;
            }
        }
            public abstract void ChangeScene();
    }
     
}
