#version 460 core

layout(location = 0) out vec4 color;

in vec4 gl_FragCoord;


uniform float values[256];
uniform int opers[256];
uniform int size;
uniform vec2 Screen_Size;
uniform vec2 zoom;
uniform vec2 offset;

float eval(vec2 pos) {
    float stack[256];
    int top = -1;
    int size_ = 0;
    while (size_ < size) {
        int front_oper = opers[size_];
        switch (front_oper) {
            case 115:{
                stack[top] = sin(stack[top]);
                break;
            }
            case 43: { // '+'
                float temp = stack[top--];
                temp += stack[top--];
                stack[++top] = temp;
                break;
            }
            case 45: { // '-'
                float temp = stack[top--];
                temp = stack[top--] - temp;
                stack[++top] = temp;
                break;
            }
            case 42: { // '*'
                float temp = stack[top--];
                temp *= stack[top--];
                stack[++top] = temp;
                break;
            }
            case 47: { // '/'
                float temp = stack[top--];
                if (abs(temp) < 0.1) { // Check if denominator is close to zero
                    stack[++top] = 1000000.0; // Return a large value
                } else {
                    temp = stack[top--]/temp;
                    stack[++top] = temp;
                }
                break;
            }
            case 94: { // '^'
                float temp = stack[top--];
                float base = stack[top--];
                if (base < 0.0 && abs(round(temp) - temp) < 0.001 ) { // Check if base is negative and exponent is fractional
                    return -1; // Return NaN (not a number)
                } else {
                    float exponent = temp * log(abs(base));
                    if (base < 0.0 && int(temp) % 2 == 1) { // Check if base is negative and exponent is odd
                        exponent = -round(exponent); // Make result negative
                    }
                    stack[++top] = exp(exponent);
                }
                break;
            }

            case 120: { // 'x'
                stack[++top] = pos.x;
                break;
            }
            case 121: { // 'y'
                stack[++top] = pos.y;
                break;
            }
            default: {
                stack[++top] = values[size_];
                break;
            }
        }
        size_++;
    }

    return stack[top];
}



vec2 cameramat(vec2 pos) {
    return((pos - offset) * zoom);
}

void main() {

    vec2 pos = cameramat(2.0 * (gl_FragCoord.xy / Screen_Size) - vec2(1, 1));
    color = vec4(step(eval(pos),0));
}
