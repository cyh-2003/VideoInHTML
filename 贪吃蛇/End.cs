using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace 贪吃蛇
{
    internal class End : StartOrEndScenceBasic
    {
        public End() 
        {
            title = "Game over";
            select = "回到开始界面";
        }
        public override void ChangeScene()
        {
            Console.Clear();
            Game.nowScene = new Start();
        }
    }
}
