import asyncio, edge_tts, os, argparse, json, sys
from pydub import AudioSegment

# FIX FOR PYTHON 3.13+
try:
    import audioop
except ImportError:
    try:
        import audioop_lts as audioop
        sys.modules["audioop"] = audioop
    except ImportError: pass

async def list_voices():
    voices = await edge_tts.list_voices()
    print(json.dumps(sorted([v["ShortName"] for v in voices])))

async def generate(args):
    p_str, r_str = f"{args.edge_pitch:+d}Hz", f"{args.edge_rate:+d}%"
    comm = edge_tts.Communicate(args.text, args.voice, pitch=p_str, rate=r_str)
    temp = f"temp_{os.getpid()}.mp3"
    await comm.save(temp)

    try:
        if not os.path.exists(temp) or os.path.getsize(temp) == 0:
            print("Error: AI Voice generation produced no data.", file=sys.stderr)
            return

        sound = AudioSegment.from_mp3(temp)
        
        def shift(audio, oct):
            sr = int(audio.frame_rate * (2.0 ** oct))
            return audio._spawn(audio.raw_data, overrides={'frame_rate': sr}).set_frame_rate(44100)

        # 1. Generate Layers
        main = shift(sound, args.shift_main)
        harm = shift(sound, args.shift_harmony).apply_gain(args.harmony_gain)
        sub = shift(sound, args.shift_sub).apply_gain(args.sub_gain)
        
        # 2. Initial Overlay
        combined = main.overlay(harm, position=args.delay_ms).overlay(sub, position=int(args.delay_ms * 1.5))
        
        # 3. Safe Echo Logic
        if args.echo_delay > 0:
            # Create a quieter version for the echo
            echo = combined - args.echo_decay 
            # position=ms into the track
            combined = combined.overlay(echo, position=args.echo_delay)

        # 4. Final Processing & Export
        combined.low_pass_filter(args.low_pass).export(args.output_path, format="wav")
        print(f"SUCCESS: {args.output_path}")

    except Exception as e:
        print(f"Python Processing Error: {str(e)}", file=sys.stderr)
        sys.exit(1)
    finally:
        if os.path.exists(temp): os.remove(temp)

if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--list", action="store_true")
    p.add_argument("--text"); p.add_argument("--voice"); p.add_argument("--output_path")
    p.add_argument("--edge_pitch", type=int, default=-30)
    p.add_argument("--edge_rate", type=int, default=-25)
    p.add_argument("--shift_main", type=float, default=-0.4)
    p.add_argument("--shift_harmony", type=float, default=-0.58)
    p.add_argument("--shift_sub", type=float, default=-1.0)
    p.add_argument("--harmony_gain", type=float, default=-7.0)
    p.add_argument("--sub_gain", type=float, default=-12.0)
    p.add_argument("--delay_ms", type=int, default=0)
    p.add_argument("--low_pass", type=int, default=2500)
    p.add_argument("--echo_delay", type=int, default=0)
    p.add_argument("--echo_decay", type=int, default=10)
    
    args = p.parse_args()
    if args.list: asyncio.run(list_voices())
    else: asyncio.run(generate(args))