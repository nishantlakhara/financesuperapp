package com.finance.superapp.calculator.domain;

import org.springframework.stereotype.Component;

@Component
public class ExpressionEvaluator {

    public double evaluate(String expression, CalculationMode mode) {
        String sanitizedExpression = expression == null ? "" : expression.replaceAll("\\s+", "");
        if (sanitizedExpression.isBlank()) {
            throw new IllegalArgumentException("Expression cannot be empty.");
        }

        Parser parser = new Parser(sanitizedExpression, mode);
        double result = parser.parseExpression();
        parser.ensureCompleted();

        if (!Double.isFinite(result)) {
            throw new IllegalArgumentException("The expression produced a non-finite result.");
        }
        return result;
    }

    private static final class Parser {

        private final String expression;
        private final CalculationMode mode;
        private int position;

        private Parser(String expression, CalculationMode mode) {
            this.expression = expression;
            this.mode = mode;
        }

        private double parseExpression() {
            double value = parseTerm();
            while (true) {
                if (match('+')) {
                    value += parseTerm();
                } else if (match('-')) {
                    value -= parseTerm();
                } else {
                    return value;
                }
            }
        }

        private double parseTerm() {
            double value = parseUnaryFactor();
            while (true) {
                if (match('*')) {
                    value *= parseUnaryFactor();
                } else if (match('/')) {
                    double divisor = parseUnaryFactor();
                    if (divisor == 0) {
                        throw new IllegalArgumentException("Division by zero is not allowed.");
                    }
                    value /= divisor;
                } else {
                    return value;
                }
            }
        }

        private double parseUnaryFactor() {
            if (match('+')) {
                return parseUnaryFactor();
            }
            if (match('-')) {
                return -parseUnaryFactor();
            }
            return parsePower();
        }

        private double parsePower() {
            double base = parsePrimary();
            if (match('^')) {
                requireScientificMode("^");
                double exponent = parseUnaryFactor();
                return Math.pow(base, exponent);
            }
            return base;
        }

        private double parsePrimary() {
            if (match('(')) {
                double value = parseExpression();
                expect(')');
                return value;
            }
            if (isDigit(peek()) || peek() == '.') {
                return parseNumber();
            }
            if (Character.isLetter(peek())) {
                return parseIdentifier();
            }
            throw new IllegalArgumentException("Unexpected token at position " + position + ".");
        }

        private double parseNumber() {
            int start = position;
            while (isDigit(peek()) || peek() == '.') {
                position++;
            }
            return Double.parseDouble(expression.substring(start, position));
        }

        private double parseIdentifier() {
            int start = position;
            while (Character.isLetter(peek())) {
                position++;
            }

            String identifier = expression.substring(start, position).toLowerCase();
            return switch (identifier) {
                case "pi" -> {
                    requireScientificMode("pi");
                    yield Math.PI;
                }
                case "e" -> {
                    requireScientificMode("e");
                    yield Math.E;
                }
                case "sqrt" -> applyScientificFunction(identifier, Math::sqrt);
                case "sin" -> applyScientificFunction(identifier, value -> Math.sin(Math.toRadians(value)));
                case "cos" -> applyScientificFunction(identifier, value -> Math.cos(Math.toRadians(value)));
                case "tan" -> applyScientificFunction(identifier, value -> Math.tan(Math.toRadians(value)));
                case "log" -> applyScientificFunction(identifier, Math::log10);
                case "ln" -> applyScientificFunction(identifier, Math::log);
                case "abs" -> applyScientificFunction(identifier, Math::abs);
                default -> throw new IllegalArgumentException("Unsupported identifier: " + identifier + ".");
            };
        }

        private double applyScientificFunction(String identifier, ScientificFunction function) {
            requireScientificMode(identifier);
            expect('(');
            double argument = parseExpression();
            expect(')');
            return function.apply(argument);
        }

        private void ensureCompleted() {
            if (position != expression.length()) {
                throw new IllegalArgumentException("Unexpected trailing content at position " + position + ".");
            }
        }

        private void requireScientificMode(String feature) {
            if (mode != CalculationMode.SCIENTIFIC) {
                throw new IllegalArgumentException(feature + " is available only in scientific mode.");
            }
        }

        private void expect(char expected) {
            if (!match(expected)) {
                throw new IllegalArgumentException("Expected '" + expected + "' at position " + position + ".");
            }
        }

        private boolean match(char candidate) {
            if (peek() == candidate) {
                position++;
                return true;
            }
            return false;
        }

        private char peek() {
            return position < expression.length() ? expression.charAt(position) : '\0';
        }

        private boolean isDigit(char candidate) {
            return candidate >= '0' && candidate <= '9';
        }
    }

    @FunctionalInterface
    private interface ScientificFunction {
        double apply(double value);
    }
}
