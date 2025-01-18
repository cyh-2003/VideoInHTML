using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace 贪吃蛇
{
    internal class Food : GameObject
    {
        public Food() 
        {
            x = 10;
            y = 10;
            //GetNewPostition();
        }
        void GetNewPostition() 
        {
            GameDate.food.x = GameDate.random.Next(1,78);
            GameDate.food.y = GameDate.random.Next(1,20);
            for (int i = 0; i < GameDate.counts; i++)
            {
                if (GameDate.food == GameDate.snakes[i]) GetNewPostition();
            }

        }
        public override void Draw()
        {
            Console.SetCursorPosition(this.x,this.y);
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.Write("♀");
        }
        public void Crush()
        {
            if (GameDate.snakes[0] == GameDate.food) 
            {
                GameDate.snakes[GameDate.counts] = new SnakeBody();
                GameDate.snakes[GameDate.counts].x = GameDate.snakes[GameDate.counts - 1].x;
                GameDate.snakes[GameDate.counts].y = GameDate.snakes[GameDate.counts - 1].y;

                GameDate.counts++;

                GetNewPostition();
            }

        }
    }
}
